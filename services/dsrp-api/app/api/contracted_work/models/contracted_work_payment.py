from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class ContractedWorkPayment(Base, AuditMixin):
    __tablename__ = 'contracted_work_payment'

    contracted_work_payment_id = db.Column(db.Integer, primary_key=True)
    application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('application.guid'), nullable=False)
    work_id = db.Column(db.String, unique=True, nullable=False)

    interim_payment_status_code = db.Column(
        db.String,
        db.ForeignKey('application_document_type.application_document_code'),
        nullable=False,
        server_default=FetchedValue())
    final_payment_status_code = db.Column(
        db.String,
        db.ForeignKey('application_document_type.application_document_code'),
        nullable=False,
        server_default=FetchedValue())

    interim_actual_cost = db.Column(db.Numeric(14, 2))
    final_actual_cost = db.Column(db.Numeric(14, 2))

    interim_paid_amount = db.Column(db.Numeric(14, 2))
    final_paid_amount = db.Column(db.Numeric(14, 2))

    interim_total_hours_worked_to_date = db.Column(db.Integer)
    final_total_hours_worked_to_date = db.Column(db.Integer)

    interim_number_of_workers = db.Column(db.Integer)
    final_number_of_workers = db.Column(db.Integer)

    interim_eoc_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)
    final_eoc_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)

    final_report_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)

    interim_eoc_document = db.relationship(
        'ApplicationDocument', foreign_keys=[interim_eoc_application_document_guid])
    final_eoc_document = db.relationship(
        'ApplicationDocument', foreign_keys=[final_eoc_application_document_guid])
    final_report_document = db.relationship(
        'ApplicationDocument', foreign_keys=[final_report_application_document_guid])

    interim_first_submitted_timestamp = db.Column(db.DateTime)
    final_first_submitted_timestamp = db.Column(db.DateTime)

    work_completion_date = db.Column(db.Date)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_id} {self.application_guid} {self.work_id}>'

    @classmethod
    def find_by_application_guid(cls, application_guid):
        return cls.query.filter_by(application_guid=application_guid).all()

    @classmethod
    def find_by_work_id(cls, work_id):
        return cls.query.filter_by(work_id=work_id).first()

    @classmethod
    def create(cls, application_guid, work_id, add_to_session=True):
        contracted_work_payment = cls(application_guid=application_guid, work_id=work_id)
        if add_to_session:
            contracted_work_payment.save(commit=False)
        return contracted_work_payment
