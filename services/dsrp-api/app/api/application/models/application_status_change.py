import io, os, cgi

from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from flask import current_app

from app.config import Config
from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.services.email_service import EmailService
from app.api.application.models.application_status import ApplicationStatus
from app.api.services.document_generator_service import DocumentGeneratorService, get_template_file_path
from app.api.services.application_status_change_actions import action_first_pay_approved


class ApplicationStatusChange(Base, AuditMixin):
    __tablename__ = 'application_status_change'

    application_status_change_id = db.Column(
        db.Integer, primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('application.guid'))
    application_status_code = db.Column(db.String,
                                        db.ForeignKey('application_status.application_status_code'))
    change_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    note = db.Column(db.String, nullable=False)

    application_status = db.relationship('ApplicationStatus')
    application = db.relationship('Application')

    def __init__(self, application, **kwargs):
        super(ApplicationStatusChange, self).__init__(**kwargs)
        self.application = application
        self.application_status = ApplicationStatus.find_by_application_status_code(
            self.application_status_code)
        self.determine_application_status_change_action()
        self.send_status_change_email()

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.application_status_code}>'

    def determine_application_status_change_action(self):
        if self.application_status_code == 'FIRST_PAY_APPROVED':
            action_first_pay_approved(self.application)

    def send_status_change_email(self):
        html_content = f"""
            <p>
                The status of your application has been changed to <b>{self.application_status.description}</b> with the following note:
				<br />
                <br />
                <span style='margin-left: 10px'>{self.note}</span>
				<br />
                <br />
                <a href='{Config.URL}/view-application-status/{self.application.guid}'>Click here to view the status of your application.</a>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </p>"""

        attachment = None
        filename = None
        if self.application_status.application_status_code == 'WAIT_FOR_DOCS':
            doc = DocumentGeneratorService.generate_document_and_stream_response(
                get_template_file_path('shared-cost-agreement'),
                self.application.shared_cost_agreement_template_json)
            value, params = cgi.parse_header(doc.headers['content-disposition'])
            filename = params['filename']
            attachment = io.BytesIO(doc.content)

        with EmailService() as es:
            es.send_email_to_applicant(self.application, 'Application Status Change', html_content,
                                       attachment, filename)
