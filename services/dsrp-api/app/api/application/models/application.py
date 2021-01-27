from datetime import datetime
from flask import current_app
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property, hybrid_method
from sqlalchemy.orm import validates
from sqlalchemy.schema import FetchedValue
from sqlalchemy import select, desc, func, and_
from marshmallow import fields
from flask_restplus import marshal

from app.config import Config
from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.constants import WELL_SITE_CONTRACTED_WORK, APPLICATION_JSON, COMPANY_NAME_JSON_KEYS
from .application_status import ApplicationStatus
from .application_status_change import ApplicationStatusChange
from app.api.application.constants import SITE_CONDITIONS, CONTRACTED_WORK, INDIGENOUS_APPLICANT_AFFILIATION, INDIGENOUS_SUBCONTRACTOR_AFFILIATION
from app.api.permit_holder.resources.permit_holder import PermitHolderResource
from app.api.application.response_models import APPLICATION
from app.api.contracted_work.response_models import CONTRACTED_WORK_PAYMENT
from app.api.application.models.application_history import ApplicationHistory
from app.api.application.models.payment_document import PaymentDocument
from app.api.contracted_work.models.contracted_work_payment import ContractedWorkPayment
from app.api.services.email_service import EmailService


class Application(Base, AuditMixin):
    __tablename__ = 'application'

    class _ModelSchema(Base._ModelSchema):
        id = fields.Integer(dump_only=True)
        guid = fields.String(dump_only=True)
        submission_date = fields.String(dump_only=True)
        status_changes = fields.Raw(dump_only=True) ##DO NOT INGEST ON POST

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    guid = db.Column(UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())

    submission_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    json = db.Column(JSONB, nullable=False)
    review_json = db.Column(JSONB)
    submitter_ip = db.Column(db.String)
    edit_note = db.Column(db.String)
    application_phase_code = db.Column(
        db.String, db.ForeignKey('application_phase_type.application_phase_code'), nullable=False)

    documents = db.relationship('ApplicationDocument', lazy='select')
    payment_documents = db.relationship(
        'PaymentDocument',
        lazy='select',
        primaryjoin=
        'and_(PaymentDocument.application_guid == Application.guid, PaymentDocument.active_ind == True)'
    )

    status_changes = db.relationship(
        'ApplicationStatusChange',
        lazy='select',
        order_by='desc(ApplicationStatusChange.change_date)',
    )

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.guid}>'

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(guid=guid).one_or_none()

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

    @company_name.expression
    def company_name(self):
        return Application.json['company_details']['company_name']['label'].astext

    @hybrid_property
    def agreement_number(self):
        return str(self.id).zfill(4)

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
                well_sites[i]['contracted_work'][cw_type]['contracted_work_total'] = round(
                    cw_total, 2)

        return well_sites

    @hybrid_method
    def contracted_work(self, status, include_payment):
        contracted_work = []
        contracted_work_payments = None
        if include_payment:
            contracted_work_payments = marshal(
                ContractedWorkPayment.find_by_application_guid(self.guid), CONTRACTED_WORK_PAYMENT)
        for ws in self.well_sites_with_review_data:
            for cw_type, cw_data in ws.get('contracted_work', {}).items():
                if cw_data.get('contracted_work_status_code', None) != status:
                    continue
                cw_item = {}
                cw_item['application_id'] = self.id
                cw_item['application_guid'] = str(self.guid)
                cw_item['company_name'] = self.company_name
                cw_item['contracted_work_type'] = cw_type
                cw_item['well_authorization_number'] = ws['details']['well_authorization_number']
                cw_item['estimated_shared_cost'] = self.calc_est_shared_cost(cw_data)
                cw_item.update(cw_data)
                if include_payment:
                    cw_payment = next((cwp for cwp in contracted_work_payments
                                       if cwp['work_id'] == cw_item['work_id']), None)
                    cw_item['contracted_work_payment'] = cw_payment
                contracted_work.append(cw_item)

        return contracted_work

    @classmethod
    def all_approved_contracted_work(self,
                                     application_id=None,
                                     application_guid=None,
                                     company_name=None):
        contracted_work_payments = []
        approved_applications = []

        if application_id or application_guid or company_name:
            if application_id and not application_guid:
                application = Application.query.filter_by(id=application_id).one_or_none()
                application_guid = application.guid if application else None
            approved_applications = Application.query.filter(
                and_(Application.application_status_code == 'FIRST_PAY_APPROVED',
                     Application.id == application_id if application_id != None else True,
                     Application.guid == application_guid if application_guid != None else True,
                     Application.company_name == company_name
                     if company_name != None else True)).order_by(Application.id).all()
            approved_application_guids = [x.guid for x in approved_applications]
            contracted_work_payments = ContractedWorkPayment.query.filter(
                Application.guid.in_(approved_application_guids)).all()
        else:
            approved_applications = Application.query.filter_by(
                application_status_code='FIRST_PAY_APPROVED').order_by(Application.id).all()
            contracted_work_payments = ContractedWorkPayment.query.all()

        contracted_work_payments_lookup = {}
        for cwp in contracted_work_payments:
            contracted_work_payments_lookup[cwp.work_id] = marshal(cwp, CONTRACTED_WORK_PAYMENT)

        approved_applications_approved_contracted_work = []
        for application in approved_applications:
            for approved_work in application.contracted_work('APPROVED', False):
                approved_work['contracted_work_payment'] = contracted_work_payments_lookup.get(
                    approved_work['work_id'], None)
                approved_work['application_phase_code'] = application.application_phase_code
                approved_applications_approved_contracted_work.append(approved_work)
        return approved_applications_approved_contracted_work

    def find_contracted_work_by_id(self, work_id):
        for ws in self.well_sites_with_review_data:
            for cw_type, cw_data in ws.get('contracted_work', {}).items():
                if cw_data['work_id'] == work_id:
                    return cw_data

    def find_contracted_work_type_by_work_id(self, work_id):
        for ws in self.well_sites_with_review_data:
            for cw_type, cw_data in ws.get('contracted_work', {}).items():
                if cw_data['work_id'] == work_id:
                    return cw_type

    def calc_est_shared_cost(self, contracted_work):
        """Calculates the contracted work item's Estimated Shared Cost, which is half of the estimated cost \
            unless that value is $100,000 or more, then it is $100,000.
        """

        half_est_cost = round(contracted_work['contracted_work_total'] / 2.0, 2)
        est_shared_cost = half_est_cost if half_est_cost <= 100000 else 100000
        return est_shared_cost

    def calc_total_est_shared_cost(self):
        """Calculates this application's contribution (sum of all contracted work Estimated Shared Cost) to the Provincial Financial Contribution total."""

        total_est_shared_cost = 0
        for ws in self.well_sites_with_review_data:
            for cw_type, cw_data in ws.get('contracted_work', {}).items():
                if cw_data.get('contracted_work_status_code', None) != 'APPROVED':
                    continue
                total_est_shared_cost += self.calc_est_shared_cost(cw_data)
        return total_est_shared_cost

    def calc_first_prf_amount(self):
        """Calculates this application's payment phase one amount, which is 10% of the total estimated shared cost."""

        return round(self.calc_total_est_shared_cost() * 0.10, 2)

    @hybrid_property
    def shared_cost_agreement_template_json(self):
        """Generates the JSON used to generate this application's Shared Cost Agreement document."""

        result = self.json

        # Create general document info
        result['agreement_no'] = self.agreement_number
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
        _applicant_name = self.applicant_name
        result['applicant_name'] = _applicant_name
        result['applicant_address'] = f'{addr1}\n{addr2}{post_cd}\n{city}, {prov}'
        result['applicant_company_name'] = _company_name
        result['funding_amount'] = '${:,.2f}'.format(self.calc_total_est_shared_cost())
        result[
            'recipient_contact_details'] = f'{_applicant_name},\n{_company_name},\n{addr1} {post_cd} {city} {prov},\n{self.applicant_email},\n{self.submitter_phone_1}'

        # Create detailed info for each well site's contracted work items
        result['formatted_well_sites'] = ""
        for ws in self.well_sites_with_review_data:
            site_details = ws.get('details', {})
            wan = site_details.get('well_authorization_number')
            for worktype, wt_details in ws.get('contracted_work', {}).items():
                if wt_details.get('contracted_work_status_code', None) != 'APPROVED':
                    continue
                site = f'\nWell Authorization Number: {wan}\n'
                site += f' Eligible Activities as described in Application: {worktype.replace("_"," ").capitalize()}\n'
                site += f' Applicant\'s Estimated Cost: {"${:,.2f}".format(wt_details.get("contracted_work_total"))}\n'
                site += f' Provincial Financial Contribution: {"${:,.2f}".format(self.calc_est_shared_cost(wt_details))}\n'
                site += f' Planned Start Date: {wt_details["planned_start_date"]}\n'
                site += f' Planned End Date: {wt_details["planned_end_date"]}\n'
                result['formatted_well_sites'] += site

        return result

    @hybrid_property
    def applicant_name(self):
        return f"{self.json['company_contact']['first_name']} {self.json['company_contact']['last_name']}"

    @hybrid_property
    def applicant_email(self):
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

    def send_confirmation_email(self):
        html_content = f"""
            <p>
                We have successfully received your application in the British Columbia Dormant Sites Reclamation Program.
                Please keep your reference number safe as you will need it to carry your application forward in this process.
                You can view the contents of your application below.
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
            """
        with EmailService() as es:
            es.send_email_to_applicant(self, 'Application Confirmation', html_content)

    def get_application_html(self):
        def create_company_details(company_details):
            indigenous_content = ''
            if self.application_phase_code == 'INITIAL':
                indigenous_participation_ind = company_details.get('indigenous_participation_ind',
                                                                   False) == True
                indigenous_content = f"""
                <h2>Indigenous Participation</h2>
                <p>{"Yes" if indigenous_participation_ind else "No"}</p>
                {f'<p>{company_details["indigenous_participation_description"]}</p>' if indigenous_participation_ind else ""}
                """
            elif self.application_phase_code == 'NOMINATION':
                indigenous_affiliation = company_details.get('indigenous_affiliation')
                indigenous_communities = company_details.get('indigenous_communities', [])
                has_indigenous_affiliation = indigenous_affiliation and indigenous_communities and indigenous_affiliation != 'NONE' and indigenous_affiliation in INDIGENOUS_APPLICANT_AFFILIATION
                indigenous_affiliation_label = INDIGENOUS_APPLICANT_AFFILIATION[
                    indigenous_affiliation] if has_indigenous_affiliation else INDIGENOUS_APPLICANT_AFFILIATION[
                        "NONE"]

                indigenous_content = f"""
                <h2>Indigenous Affiliation</h2>
                <p>{indigenous_affiliation_label}</p>
                """

                if has_indigenous_affiliation:

                    def create_indigenous_community(community):
                        return f'<li>{community}</li>'

                    indigenous_content += f"""
                    <h3>Indigenous Peoples</h3>
                    <ul>
                    {''.join([create_indigenous_community(community) for community in indigenous_communities])}
                    </ul>
                    """

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

            {indigenous_content}
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
                    def create_indigenous_subcontractors(section, contracted_work):
                        if self.application_phase_code == 'INITIAL':
                            return ''

                        def create_indigenous_subcontractor(number, subcontractor):
                            return f"""
                            Subcontractor {number}:<br />
                            <p>
                            Subcontractor Name: {subcontractor['indigenous_subcontractor_name']}<br />
                            Indigenous Affiliation: {INDIGENOUS_SUBCONTRACTOR_AFFILIATION[subcontractor['indigenous_affiliation']]}<br />
                            Indigenous Peoples:<br />
                            <ul>
                            {''.join([f'<li>{community}</li>' for community in subcontractor['indigenous_communities']])}
                            </ul>
                            </p>
                            """

                        indigenous_subcontractors = contracted_work.get(
                            section['section_name'], {}).get('indigenous_subcontractors', [])
                        indigenous_subcontractors_content = 'N/A' if not indigenous_subcontractors else ''.join(
                            [
                                create_indigenous_subcontractor(i + 1, subcontractor)
                                for i, subcontractor in enumerate(indigenous_subcontractors)
                            ])
                        return f"""
                        <p><u>Indigenous Subcontractors</u></p>
                        {indigenous_subcontractors_content}
                        """

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
                    <br />
                    {create_indigenous_subcontractors(section, contracted_work)}
                    """

                def create_site_condition(site_conditions):
                    site_conditions_section = "" if self.application_phase_code == 'NOMINATION' else f"""
                    h3>Site Conditions</h3>
                    {''.join()}
                    <ul>
                    {''.join([create_site_condition(condition, well_site["site_conditions"]) for condition in SITE_CONDITIONS])}
                    </ul>
                    """

                return f"""
                <h2>Well Site {index + 1}</h2>

                <h3>Well Authorization Number</h3>
                <p>{well_site["details"]["well_authorization_number"]}</p>

                {create_site_condition(well_site)}

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

    def save_application_history(self):
        application_json = marshal(self, APPLICATION)
        application_json["application_id"] = self.id
        application_history = ApplicationHistory._schema().load(application_json)
        application_history.save()
        return application_history

    def process_well_sites_work_items(self, well_sites_json, func, **args):
        def perform(self, fun, **args):
            fun(**args)

        for site in well_sites_json:
            contracted_work = site.get('contracted_work')
            works = list(set(list(WELL_SITE_CONTRACTED_WORK.keys())).intersection(contracted_work))
            for i in works:
                work_item = contracted_work.get(i)
                if args is not None:
                    args["work_item"] = work_item

                perform(self, func, **args)

    def update_work_item_action(self, work_item, id, planned_start_date, planned_end_date):
        if work_item["work_id"] == id:
            work_item["planned_start_date"] = planned_start_date
            work_item["planned_end_date"] = planned_end_date

    def iterate_application_work_items_action(self, work_item):
        application_json = marshal(self, APPLICATION)
        json = application_json["json"]["well_sites"]
        args = {
            "id": work_item["work_id"],
            "planned_start_date": work_item["planned_start_date"],
            "planned_end_date": work_item["planned_end_date"]
        }
        self.process_well_sites_work_items(json, self.update_work_item_action, **args)
