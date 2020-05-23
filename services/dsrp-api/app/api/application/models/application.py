from flask import current_app
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.config import Config
from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate
from .application_status import ApplicationStatus
from app.api.application.constants import SITE_CONDITIONS, CONTRACTED_WORK
from app.api.permit_holder.resources.permit_holder import PermitHolderResource


class Application(Base, AuditMixin):
    __tablename__ = 'application'

    class _ModelSchema(Base._ModelSchema):
        id = fields.Integer(dump_only=True)
        guid = fields.String(dump_only=True)
        submission_date = fields.String(dump_only=True)

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    guid = db.Column(UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())

    submission_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    json = db.Column(JSONB, nullable=False)
    review_json = db.Column(JSONB)
    submitter_ip = db.Column(db.String)

    documents = db.relationship('ApplicationDocument', lazy='select')
    status_changes = db.relationship('ApplicationStatusChange', lazy='joined', order_by='desc(ApplicationStatusChange.change_date)',)

    def __repr__(self):
        return f'<{self.__name__} {self.guid}>'

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(guid=guid).first()

    @hybrid_property
    def submitter_email(self):
        return self.json.get('company_contact', {}).get('email')
    
    @hybrid_property
    def application_status_code(self):
        if self.status_changes:
          return self.status_changes[0].application_status_code
        else:
          return 'NOT_STARTED'

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
                We have successfully received your application in the BC Governments Dormant
                Site Reclamation Program. Please keep your reference number safe as you will
                need it to carry your application forward in this process. You can view the 
                contents of your application below.
				<br />
				<br />
                <a href='{Config.URL}/view-application-status/{self.guid}'>Click here to view the status of your application.</a>
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

        email_service.send_email(self.submitter_email,
                                 'Application Confirmation', html_body)

    def get_application_html(self):
        def create_company_details(company_details):
            indigenous_participation_ind = company_details.get(
                "indigenous_participation_ind", False) == True
            return f"""
            <h1>Company Details<h1>

            <h2>Company Name</h2>
            <p>{company_details["company_name"]["label"]}</p>

            <h2>Company Address</h2>
            <p>
            {company_details["city"]} {company_details["province"]} Canada
            <br />
            {company_details["address_line_1"]}
            <br />
            {f'{company_details["address_line_2"]}</br />' if company_details.get("address_line_2") else ""}
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
                    self,
                    operator_id=contract_details["operator_id"])["records"][0]
            except:
                current_app.logger.warning(
                    'Failed to find the permit holder. Displaying operator ID instead.'
                )

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
                    def create_sub_section(sub_section, section,
                                           contracted_work):
                        def create_amount_field(amount_field, section,
                                                contracted_work):
                            return f"""
                                <tr>
                                <td>{amount_field["label"]}:</td>
                                <td>{'$0.00' if not (section["section_name"] in contracted_work and (amount_field["name"] in contracted_work[section["section_name"]])) else f'${contracted_work[section["section_name"]][amount_field["name"]] or "0.00"}'}</td>
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

        style = """
        <style>
            table.contracted_work_amount th, td {
            padding-left: 10px;
            }
        </style>
        """

        html = f"""
        {style}
        {create_company_details(self.json["company_details"])}     
        {create_company_contact(self.json["company_contact"])}
        {create_contract_details(self.json["contract_details"])}
        {create_well_sites(self.json["well_sites"])}
        """

        return html
