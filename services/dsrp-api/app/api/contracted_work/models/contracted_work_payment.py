from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import desc, func, and_, select

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.contracted_work.models.contracted_work_payment_status_change import ContractedWorkPaymentStatusChange


class ContractedWorkPayment(Base, AuditMixin):
    __tablename__ = 'contracted_work_payment'

    def __init__(self, contracted_work_payment_status_code, contracted_work_payment_code, **kwargs):
        super(ContractedWorkPayment, self).__init__(**kwargs)
        initial_status = ContractedWorkPaymentStatusChange(
            contracted_work_payment_status_code=contracted_work_payment_status_code,
            contracted_work_payment_code=contracted_work_payment_code)
        self.status_changes.append(initial_status)

    contracted_work_payment_id = db.Column(db.Integer, primary_key=True)
    application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('application.guid'), nullable=False)
    work_id = db.Column(db.String, unique=True, nullable=False)

    interim_actual_cost = db.Column(db.Numeric(14, 2))
    final_actual_cost = db.Column(db.Numeric(14, 2))

    interim_paid_amount = db.Column(db.Numeric(14, 2))
    final_paid_amount = db.Column(db.Numeric(14, 2))

    interim_total_hours_worked_to_date = db.Column(db.Integer)
    final_total_hours_worked_to_date = db.Column(db.Integer)

    interim_number_of_workers = db.Column(db.Integer)
    final_number_of_workers = db.Column(db.Integer)

    work_completion_date = db.Column(db.Date)

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
        'ApplicationDocument', lazy='select', foreign_keys=[interim_eoc_application_document_guid])
    final_eoc_document = db.relationship(
        'ApplicationDocument', lazy='select', foreign_keys=[final_eoc_application_document_guid])

    interim_report = db.Column(db.String)
    final_report_document = db.relationship(
        'ApplicationDocument', lazy='select', foreign_keys=[final_report_application_document_guid])

    status_changes = db.relationship(
        'ContractedWorkPaymentStatusChange',
        lazy='selectin',
        order_by='desc(ContractedWorkPaymentStatusChange.change_timestamp)')

    @hybrid_property
    def interim_payment_status_code(self):
        if self.interim_payment_status:
            return self.interim_payment_status.contracted_work_payment_status_code
        else:
            return 'INFORMATION_REQUIRED'

    @hybrid_property
    def interim_payment_status(self):
        if self.interim_payment_status_changes:
            return self.interim_payment_status_changes[0]

    @hybrid_property
    def interim_payment_status_changes(self):
        return [
            status for status in self.status_changes
            if status.contracted_work_payment_code == 'INTERIM'
        ]

    @hybrid_property
    def interim_payment_submission_date(self):
        if self.interim_payment_status_changes:
            return self.interim_payment_status_changes[-1].change_timestamp

    @hybrid_property
    def final_payment_status_code(self):
        if self.final_payment_status:
            return self.final_payment_status.contracted_work_payment_status_code
        else:
            return 'INFORMATION_REQUIRED'

    @hybrid_property
    def final_payment_status(self):
        if self.final_payment_status_changes:
            return self.final_payment_status_changes[0]

    @hybrid_property
    def final_payment_status_changes(self):
        return [
            status for status in self.status_changes
            if status.contracted_work_payment_code == 'FINAL'
        ]

    @hybrid_property
    def final_payment_submission_date(self):
        if self.final_payment_status_changes:
            return self.final_payment_status_changes[-1].change_timestamp

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_id} {self.application_guid} {self.work_id}>'

    @classmethod
    def find_by_application_guid(cls, application_guid):
        return cls.query.filter_by(application_guid=application_guid).all()

    @classmethod
    def find_by_work_id(cls, work_id):
        return cls.query.filter_by(work_id=work_id).first()
