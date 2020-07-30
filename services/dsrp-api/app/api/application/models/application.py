from datetime import datetime
from flask import current_app
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy import select, desc, func
from marshmallow import fields, validate

from app.config import Config
from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate
from app.api.constants import WELL_SITE_CONTRACTED_WORK, APPLICATION_JSON, COMPANY_NAME_JSON_KEYS
from .application_status import ApplicationStatus
from .application_status_change import ApplicationStatusChange
from app.api.application.constants import SITE_CONDITIONS, CONTRACTED_WORK
from app.api.permit_holder.resources.permit_holder import PermitHolderResource


class Application(Base, AuditMixin):
    __tablename__ = 'application'

    class _ModelSchema(Base._ModelSchema):
        id = fields.Integer(dump_only=True)
        guid = fields.String(dump_only=True)
        submission_date = fields.String(dump_only=True)
        status_changes = fields.Raw(dump_only=True)  ##DO NOT INGEST ON POST

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    guid = db.Column(UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())

    submission_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    json = db.Column(JSONB, nullable=False)
    review_json = db.Column(JSONB)
    submitter_ip = db.Column(db.String)

    documents = db.relationship('ApplicationDocument', lazy='select')
    status_changes = db.relationship(
        'ApplicationStatusChange',
        lazy='joined',
        order_by='desc(ApplicationStatusChange.application_status_change_id)',
    )

    def __repr__(self):
        return f'<Application: {self.guid}>'

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(guid=guid).first()

    @validates('json')
    def validate_json(self, key, json):
        well_sites = json.get('well_sites')
        for site in well_sites:
            contracted_work = site.get('contracted_work')
            work = list(set(list(WELL_SITE_CONTRACTED_WORK.keys())).intersection(contracted_work))
            if len(work) == 0:
                raise AssertionError(
                    'Application must contain at least one piece of contracted work.')
            for i in work:
                work_item = contracted_work.get(i)
                total = [
                    value for key, value in work_item.items()
                    if key in WELL_SITE_CONTRACTED_WORK.get(i)
                ]
                if sum(total) == 0:
                    raise AssertionError('Contracted works must have an amount greater than $0')
        for key, value in APPLICATION_JSON.items():
            k = json.get(key, None)
            if k:
                for item in value:
                    if item == 'company_name':
                        company_name = k.get(item, None)
                        if company_name:
                            for i in COMPANY_NAME_JSON_KEYS:
                                if not company_name.get(i, None):
                                    raise AssertionError(f'{i} must not be None')
                        else:
                            raise AssertionError(f'{item} must not be None')
                    if not k.get(item, None):
                        raise AssertionError(f'{item} must not be None')
            else:
                raise AssertionError(f'{key} must not be None')

        return json

    @hybrid_property
    def company_name(self):
        return self.json.get('company_details', {}).get('company_name', {}).get('label')

    @hybrid_property
    def well_sites_with_review_data(self):
        """Merges well sites with their corresponding review data and provides extra information."""

        well_sites = self.json.get('well_sites')

        # Merge well sites with their corresponding review data.
        if self.review_json:
            ws_reviews = self.review_json.get('well_sites')
            for i, ws_review in enumerate(ws_reviews):
                if not ws_review:
                    continue
                for wan, review_data in ws_review.items():
                    for k, v in review_data.items():
                        if k != 'contracted_work':
                            continue
                        for cw_type, cw_data in v.items():
                            well_sites[i]['contracted_work'][cw_type].update(cw_data)

        # Calculate the sum for each contracted work item
        for i, well_site in enumerate(well_sites):
            for cw_type, cw_data in well_site.get('contracted_work', {}).items():
                cw_total = 0
                for k, v in cw_data.items():
                    if k in WELL_SITE_CONTRACTED_WORK[cw_type]:
                        cw_total += v
                well_sites[i]['contracted_work'][cw_type]['contracted_work_total'] = round(cw_total, 2)

        return well_sites

    def calculate_est_shared_cost(self, contracted_work):
        """Calculates the contracted work item's Estimated Shared Cost, which is half of the estimated cost \
            unless that value is $100,000 or more, then it is $100,000.
        """

        half_est_cost = round(contracted_work['contracted_work_total'] / 2.0, 2)
        est_shared_cost = half_est_cost if half_est_cost <= 100000 else 100000
        return est_shared_cost

    def calc_total_prov_contribution(self):
        """Calculates this application's contribution to the Provincial Financial Contribution total."""

        well_sites = self.well_sites_with_review_data
        total_prov_contribution = 0
        for ws in well_sites:
            for worktype, wt_details in ws.get('contracted_work', {}).items():
                if wt_details.get('contracted_work_status_code', None) != 'APPROVED':
                    continue
                total_prov_contribution += self.calculate_est_shared_cost(wt_details)
        return total_prov_contribution

    @hybrid_property
    def shared_cost_agreement_template_json(self):
        """Generates the JSON used to generate this application's Shared Cost Agreement document."""

        result = self.json

        # Create general document info
        result['agreement_no'] = str(self.id).zfill(4)
        result['application_guid'] = str(self.guid)
        result['agreement_date'] = datetime.now().strftime("%d, %b, %Y")

        # Create company info
        _company_details = self.json.get('company_details')
        _company_name = _company_details['company_name']['label']
        addr1 = _company_details.get('address_line_1')
        addr2 = _company_details.get('address_line_2') + '\n' if _company_details.get(
            'address_line_2') else ""
        city = _company_details.get('city')
        post_cd = _company_details.get('postal_code')
        prov = _company_details.get('province')

        # Create applicant info
        _applicant_name = f"{self.json['company_contact']['first_name']} {self.json['company_contact']['last_name']}"
        result['applicant_name'] = _applicant_name
        result['applicant_address'] = f'{addr1}\n{addr2}{post_cd}\n{city}, {prov}'
        result['applicant_company_name'] = _company_name
        result['funding_amount'] = '${:,.2f}'.format(self.calc_total_prov_contribution())
        result['recipient_contact_details'] = f'{_applicant_name},\n{_company_name},\n{addr1} {post_cd} {city} {prov},\n{self.submitter_email},\n{self.submitter_phone_1}'

        # Create detailed info for each well site's contracted work items
        well_sites = self.well_sites_with_review_data
        result['formatted_well_sites'] = ""
        for ws in well_sites:
            site_details = ws.get('details', {})
            wan = site_details.get('well_authorization_number')
            for worktype, wt_details in ws.get('contracted_work', {}).items():
                if wt_details.get('contracted_work_status_code', None) != 'APPROVED':
                    continue
                site = f'\nWell Authorization Number: {wan}\n'
                site += f' Eligible Activities as described in Application: {worktype.replace("_"," ").capitalize()}\n'
                site += f' Applicant\'s Estimated Cost: {"${:,.2f}".format(wt_details.get('contracted_work_total'))}\n'
                site += f' Provincial Financial Contribution: {"${:,.2f}".format(self.calculate_est_shared_cost(wt_details))}\n'
                site += f' Planned Start Date: {wt_details["planned_start_date"]}\n'
                site += f' Planned End Date: {wt_details["planned_end_date"]}\n'
                result['formatted_well_sites'] += site

        return result

    @hybrid_property
    def submitter_email(self):
        return self.json.get('company_contact', {}).get('email')

    @hybrid_property
    def submitter_phone_1(self):
        ph1 = self.json.get('company_contact', {}).get('phone_number_1')
        ph1_ext = self.json.get('company_contact', {}).get('phone_number_1_ext')

        return ph1 if not ph1_ext else f'{ph1} ext.{ph1_ext}'

    @hybrid_property
    def application_status_code(self):
        if self.status_changes:
            return self.status_changes[0].application_status_code
        else:
            return 'NOT_STARTED'

    @application_status_code.expression
    def application_status_code(self):
        return func.coalesce(
            select([ApplicationStatusChange.application_status_code
                    ]).where(ApplicationStatusChange.application_guid == self.guid).order_by(
                        desc(ApplicationStatusChange.change_date)).limit(1).as_scalar(),
            'NOT_STARTED')

    def send_confirmation_email(self, email_service):
        if not self.submitter_email:
            raise Exception(
                'Application.json.company_contact.email is not set, must set before email can be sent'
            )

        html_body = f"""<div class="WordSection1" style="margin:0;">
  <table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%"
    style="background:#003366; border-collapse:collapse">
    <tbody>
      <tr>
        <td width="217" colspan="2" valign="top"
          style="width:163.05pt; border-top:none; border-left:solid windowtext 1.0pt; border-bottom:solid #FCBA19 3.0pt; border-right:none; padding:3mm 0mm 3mm 3mm">
          <img src="http://news.gov.bc.ca/Content/Images/Gov/gov3_bc_logo.png"
            alt="Government of B.C." title="Government of B.C.">
        </td>
        <td width="207" colspan="2"
          style="width:155.05pt; border:none; border-bottom:solid #FCBA19 3.0pt; padding:0cm 0cm 0cm 0cm">
          <p class="MsoNormal" align="center"
            style="margin-bottom:0cm; margin-bottom:.0001pt; text-align:center; line-height:normal">
            <span style="font-size:16.0pt; color:white">Dormant Sites Reclamation Program</span></p>
        </td>
        <td width="94" colspan="2"
          style="width:70.55pt; border:none; border-bottom:solid #FCBA19 3.0pt; padding:0cm 0cm 0cm 0cm">
          <p class="MsoNormal" align="center"
            style="margin-bottom:0cm; margin-bottom:.0001pt; text-align:center; line-height:normal">
            <span style="font-size:16.0pt">&nbsp;</span></p>
        </td>
      </tr>

      <tr style="height:13.6pt">
        <td width="47" valign="top"
          style="width:35.45pt; border:none; border-left:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            &nbsp;</p>
        </td>
        <td width="184" colspan="2" valign="top"
          style="width:138.25pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
		  <br/>
		  <br/>
		  <br/>
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            <span style="font-size:12.0pt; color:#595959">Reference Number</span></p>
        </td>
        <td width="232" colspan="2" valign="top"
          style="width:173.8pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
		  <br/>
		  <br/>
		  <br/>
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            <b><span style="font-size:12.0pt; color:#595959">{self.guid}</span></b></p>
        </td>
        <td width="55" valign="top"
          style="width:41.15pt; border:none; border-right:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            &nbsp;</p>
        </td>
      </tr>

      <tr style="height:25pt">
        <td width="47" valign="top"
          style="width:35.45pt; border:none; border-left:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            &nbsp;</p>
        </td>
        <td width="416" colspan="4" valign="top"
          style="width:312.05pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
        </td>
        <td width="55" valign="top"
          style="width:41.15pt; border:none; border-right:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            &nbsp;</p>
        </td>
      </tr>

      <tr>
        <td width="47" valign="top"
          style="width:41.15pt; border:none; border-left:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            &nbsp;</p>
        </td>
        <td colspan="4" width="416" valign="top"
          style="width:41.15pt; border:none; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
          <p>
                We have successfully received your application in the British Columbia Dormant Sites Reclamation Program. Please keep your reference number safe as you will
                need it to carry your application forward in this process. You can view the 
                contents of your application below.
				<br />
				<br />
                <a href='{Config.URL}view-application-status/{self.guid}'>Click here to view the status of your application.</a>
                <br/>
                <br/>
		  <br/>
		  <br/>
		  <br/>
          </p>
          {self.get_application_html()}
        </td>
        <td width="55" valign="top"
          style="width:41.15pt; border:none; border-right:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
          <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
            &nbsp;</p>
        </td>
      </tr>

      <tr style="height:22.3pt">
        <td width="518" colspan="6"
          style="border:none; border-top:solid #FCBA19 3.0pt; padding:0cm 5.4pt 0cm 5.4pt; height:22.3pt">
          <p class="MsoNormal" align="right"
            style="margin-bottom:0cm; margin-bottom:.0001pt; text-align:right; line-height:normal">
          </p>
        </td>
      </tr>

      <tr>
        <td width="59" style="width:44.25pt; padding:0cm 0cm 0cm 0cm"></td>
        <td width="213" style="width:159.75pt; padding:0cm 0cm 0cm 0cm"></td>
        <td width="18" style="width:13.5pt; padding:0cm 0cm 0cm 0cm"></td>
        <td width="241" style="width:180.75pt; padding:0cm 0cm 0cm 0cm"></td>
        <td width="49" style="width:36.75pt; padding:0cm 0cm 0cm 0cm"></td>
        <td width="69" style="width:51.75pt; padding:0cm 0cm 0cm 0cm"></td>
      </tr>
    </tbody>
  </table>
  <p class="MsoNormal"><span lang="EN-US">&nbsp;</span></p>
  <p class="MsoNormal"><span>&nbsp;</span></p>
</div>
        """
        email_service.send_email(self.submitter_email, 'Application Confirmation', html_body)

    def get_application_html(self):
        def create_company_details(company_details):
            indigenous_participation_ind = company_details.get("indigenous_participation_ind",
                                                               False) == True
            return f"""
            <h1>Company Details</h1>

            <h2>Company Name</h2>
            <p>{company_details["company_name"]["label"]}</p>

            <h2>Company Address</h2>
            <p>
            {company_details["city"]} {company_details["province"]} Canada
            <br />
            {company_details["address_line_1"]}
            <br />
            {f'{company_details["address_line_2"]}<br />' if company_details.get("address_line_2") else ""}
            {company_details["postal_code"]}
            </p>

            <h2>Business Number</h2>
            <p>{company_details["business_number"]}</p>

            <h2>Indigenous Participation</h2>
            <p>{"Yes" if indigenous_participation_ind else "No"}</p>
            {f'<p>{company_details["indigenous_participation_description"]}</p>' if indigenous_participation_ind else ""}
            """

        def create_company_contact(company_contact):
            return f"""
            <h1>Company Contact</h1>

            <p>{company_contact["first_name"]} {company_contact["last_name"]}</p>
            <p>{company_contact["email"]}</p>
            <p>
            Phone: {company_contact["phone_number_1"]}<br />     
            {f'Ext.: {company_contact["phone_ext_1"]}<br />' if company_contact.get("phone_ext_1") else ""} 
            {f'Phone 2.: {company_contact["phone_number_2"]}<br />' if company_contact.get("phone_number_2") else ""}
            {f'Ext. 2: {company_contact["phone_ext_2"]}<br />' if company_contact.get("phone_ext_2") else ""}
            {f'Fax: {company_contact["fax"]}<br />' if company_contact.get("fax") else ""}
            </p>
            """

        def create_contract_details(contract_details):
            try:
                permit_holder = PermitHolderResource.get(
                    self, operator_id=contract_details["operator_id"])["records"][0]
            except:
                current_app.logger.warning(
                    'Failed to find the permit holder. Displaying operator ID instead.')

            return f"""
            <h1>Contract Details</h1>

            <h2>Permit Holder</h2>
            <p>{permit_holder["organization_name"] if permit_holder else f'Operator ID: {contract_details["operator_id"]}'}</p>
            """

        def create_well_sites(well_sites):
            def create_well_site(well_site, index):
                def create_site_condition(condition, site_conditions):
                    return f"<li><b>{condition['label']}</b>: {'Yes' if condition['name'] in site_conditions and site_conditions[condition['name']] == True else 'No'}</li>"

                def create_contracted_work_section(section, contracted_work):
                    def create_sub_section(sub_section, section, contracted_work):
                        def create_amount_field(amount_field, section, contracted_work):
                            return f"""
                                <tr>
                                <td style="padding-left: 10px;">{amount_field["label"]}:</td>
                                <td style="padding-left: 10px;">{'$0.00' if not (section["section_name"] in contracted_work and (amount_field["name"] in contracted_work[section["section_name"]])) else f'${contracted_work[section["section_name"]][amount_field["name"]] or "0.00"}'}</td>
                                </tr>
                            """

                        return f"""
                        <p><u>{sub_section["sub_section_header"]}</u></p>
                        <table class="contracted_work_amount">
                        {''.join([create_amount_field(amount_field, section, contracted_work) for amount_field in sub_section["amount_fields"]])}
                        </table>
                        """

                    return f"""             
                    <h4>{section["section_header"]}</h4>
                    <p>Planned Start Date: {contracted_work[section["section_name"]]["planned_start_date"] if contracted_work.get(section["section_name"]) and contracted_work.get(section["section_name"]).get("planned_start_date") else "N/A"}</p>
                    <p>Planned End Date: {contracted_work[section["section_name"]]["planned_end_date"] if contracted_work.get(section["section_name"]) and contracted_work.get(section["section_name"]).get("planned_end_date") else "N/A"}</p>
                    {''.join([create_sub_section(sub_section, section, contracted_work) for sub_section in section["sub_sections"]])}
                    """

                return f"""
                <h2>Well Site {index + 1}</h2>

                <h3>Well Authorization Number</h3>
                <p>{well_site["details"]["well_authorization_number"]}</p>

                <h3>Site Conditions</h3>
                <ul>
                {''.join([create_site_condition(condition, well_site["site_conditions"]) for condition in SITE_CONDITIONS])}
                </ul>

                <h3>Contracted Work</h3>
                {''.join([create_contracted_work_section(section, well_site["contracted_work"]) for section in CONTRACTED_WORK])}
                <hr />
                """

            return f"""
            <h1>Well Sites</h1>
            {''.join([create_well_site(well_site, index) for index, well_site in enumerate(well_sites)])}
            """

        html = f"""
        {create_company_details(self.json["company_details"])}     
        {create_company_contact(self.json["company_contact"])}
        {create_contract_details(self.json["contract_details"])}
        {create_well_sites(self.json["well_sites"])}
        """

        return html
