import io

from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.services.email_service import EmailService
from app.api.services.document_generator_service import DocumentGeneratorService, get_template_file_path
from app.api.contracted_work.models.contracted_work_payment_status import ContractedWorkPaymentStatus
from app.api.contracted_work.models.contracted_work_payment_type import ContractedWorkPaymentType
from app.config import Config


class ContractedWorkPaymentStatusChange(Base, AuditMixin):
    __tablename__ = 'contracted_work_payment_status_change'

    contracted_work_payment_status_change_id = db.Column(db.Integer, primary_key=True)
    contracted_work_payment_id = db.Column(
        db.Integer,
        db.ForeignKey('contracted_work_payment.contracted_work_payment_id'),
        nullable=False)
    contracted_work_payment_status_code = db.Column(
        db.String,
        db.ForeignKey('contracted_work_payment_status.contracted_work_payment_status_code'),
        nullable=False)
    contracted_work_payment_code = db.Column(
        db.String,
        db.ForeignKey('contracted_work_payment_type.contracted_work_payment_code'),
        nullable=False)
    change_timestamp = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    note = db.Column(db.String)

    def __init__(self, application, **kwargs):
        super(ContractedWorkPaymentStatusChange, self).__init__(**kwargs)
        if self.contracted_work_payment_status_code == 'INFORMATION_REQUIRED':
            self.send_status_change_email(application)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_status_change_id}>'

    def send_status_change_email(self, application):
        from app.api.contracted_work.models.contracted_work_payment import ContractedWorkPayment

        contracted_work_payment_status = ContractedWorkPaymentStatus.find_by_code(
            self.contracted_work_payment_status_code)
        contracted_work_payment_type = ContractedWorkPaymentType.find_by_code(
            self.contracted_work_payment_code)
        contracted_work_payment = ContractedWorkPayment.query.filter_by(
            contracted_work_payment_id=self.contracted_work_payment_id).one()
        html_content = f"""
            <p>
                The <b>{contracted_work_payment_type.description}</b> payment status of the contracted work item on your application with the work ID <b>{contracted_work_payment.work_id}</b> has been changed to <b>{contracted_work_payment_status.description}</b> with the following note:
				<br />
                <br />
                <span style='margin-left: 10px'>{self.note}</span>
				<br />
                <br />
                <a href='{Config.URL}/view-application-status/{application.guid}'>Click here to view the status of your application.</a>
                <br/>
                <br/>
                <br/>
                <br/>
                <br/>
            </p>"""

        with EmailService() as es:
            es.send_email_to_applicant(application, 'Contracted Work Payment Status Change',
                                       html_content)
