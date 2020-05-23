import json
from flask import current_app
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate
from collections import namedtuple

from app.config import Config
from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate

from .application_status import ApplicationStatus






def site_condition(name, label):
    return {
        "name": name,
        "label": label
    }

SITE_CONDITIONS = [
  site_condition("within_1000m_stream", "Within 1,000 metres of a stream"),
  site_condition("within_500m_groundwater_well", "Within 500 metres of a groundwater well"),
  site_condition(
    "within_environmental_protection",
    "Within environmental protection and management area or critical habitat"
  ),
  site_condition("suspected_offsite_contamination", "Suspected or known to have offsite contamination"),
  site_condition(
    "within_1500m_private_residence",
    "Within 1,500 metres of a private residence or community gathering area"
  ),
  site_condition(
    "within_active_area_trapping",
    "Within an area actively used for trapping, guide outfitting, range tenure or hunting"
  ),
  site_condition("on_crown_land_winter_access", "On Crown land that is winter access only"),
  site_condition("drilled_abandonded_prior_1997", "Drilled or abandoned prior to 1997"),
  site_condition(
    "within_treaty_land_entitlement",
    "Within Treaty Land Entitlement, cultural lands and/or Indigenous peoples' critical areas"
  ),
  site_condition("within_sensitive_watersheds", "Within sensitive watersheds that service communities"),
  site_condition("on_or_near_reserve_lands", "On or near reserve lands"),
  site_condition(
    "permit_holider_notice_dormant",
    "Permit holder has provided notice that this site is dormant to achieve cost efficiencies for an area-based closure plan"
  ),
  site_condition("located_agricultural_land_reserve", "Located inside Agricultural Land Reserve"),
  site_condition(
    "permit_holder_work_specified_2020_awp",
    "Specified work that was included in a permit holder's Dormant Sites 2020 Annual Work Plan"
  )
]


class Application(Base, AuditMixin):
    __tablename__ = 'application'

    class _ModelSchema(Base._ModelSchema):
        id = fields.Integer(dump_only=True)
        guid = fields.String(dump_only=True)
        submission_date = fields.String(dump_only=True)
        application_status_code = FieldTemplate(field=fields.String, one_of='ApplicationStatus')

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    guid = db.Column(UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())
    application_status_code = db.Column(
        db.String,
        db.ForeignKey('application_status.application_status_code'),
        nullable=False,
        server_default=FetchedValue())
    submission_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    json = db.Column(JSONB, nullable=False)
    review_json = db.Column(JSONB)
    submitter_ip = db.Column(db.String)

    documents = db.relationship('ApplicationDocument', lazy='select')

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
        return self.json.get('company_contact', {'email': None}).get('email', None)

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
                need it to carry your application forward in this process.
				<br />
				<br />
                <a href='{Config.URL}/view-application-status/{self.guid}'>Click here to view the status of your application.</a>
                <br/>
                <br/>
		  <br/>
		  <br/>
		  <br/>
          </p>
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

    json_key_desc = {

    }

    def get_application_email_display(self):
        application = json.loads(json.dumps(self.json), object_hook=lambda d: namedtuple('Application', d.keys())(*d.values()))

        def create_company_details(company_details):
            return f"""
            <h2>Company Details<h2>

            <h3>Company Name</h3>
            <p>{company_details.company_name.label}</p>

            <h3>Business Number</h3>
            <p>{company_details.business_number}</p>

            <h3>Indigenous Participation</h3>
            <p>{"Yes" if company_details.indigenous_participation_ind else "No"}</p>
            <p>{company_details.indigenous_participation_description if company_details.indigenous_participation_ind else ""}</p>

            <h3>Address</h3>
            <p>
            {company_details.city} {company_details.province} Canada
            <br />
            {company_details.address_line_1}
            <br />
            {company_details.address_line_2}
            <br />
            {company_details.postal_code}
            </p>
            """

        def create_company_contact(company_contact):
            return f"""
            <h2>Company Contact</h2>

            <p>{company_contact.first_name} {company_contact.last_name}</p>
            <p>{company_contact.email}</p>
            <p>
            Phone: {company_contact.phone_number_1}
            <br />
            Ext.: {company_contact.phone_ext_1}
            <br />
            Phone 2: {company_contact.phone_number_1}
            <br />
            Ext. 2: {company_contact.phone_ext_1}
            <br />
            Fax: {company_contact.fax}
            <br />
            </p>
            <br />
            """

        # TODO: Get the name of the permit holder
        def create_contract_details(contract_details):
            return f"""
            <h2>Contract Details</h2>

            <p>{contract_details.operator_id}</p>
            <br />
            """

        def create_well_sites(well_sites):

            def create_well_site(well_site, index):
                def create_site_condition(definition, site_conditions):
                    current_app.logger.info(definition)
                    current_app.logger.info(site_conditions)
                    return f"<p><b>{definition['label']}</b>: {'Yes' if definition['name'] in site_conditions and site_conditions[definition['name']] == True else 'No'}"

                return f"""
                <h3>Well Site {index + 1}</h3>

                <h4>Well Authorization Number</h4>
                <p>{well_site.details.well_authorization_number}</p>

                <h4>Site Conditions</h4>
                <p>{''.join([create_site_condition(definition, well_site.site_conditions._asdict()) for definition in SITE_CONDITIONS])}</p>

                """

            return f"""
            <h2>Well Sites</h2>

            {''.join([create_well_site(well_site, index) for index, well_site in enumerate(well_sites)])}

            <br />
            """            

        html = f"""
        {create_company_details(application.company_details)}
        <br />
        {create_company_contact(application.company_contact)}
        <br />
        {create_contract_details(application.contract_details)}
        <br />
        {create_well_sites(application.well_sites)}
        """

        return html