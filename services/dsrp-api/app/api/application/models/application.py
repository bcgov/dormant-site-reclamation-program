import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.config import Config
from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate

from .application_status import ApplicationStatus


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
    json = db.Column(db.JSON, nullable=False)
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
            <span style="font-size:12.0pt; color:#595959">Confirmation Number</span></p>
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
          style="width:388.65pt; border:none; border-top:solid #FCBA19 3.0pt; padding:0cm 5.4pt 0cm 5.4pt; height:22.3pt">
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