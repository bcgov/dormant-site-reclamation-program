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
        nullable=False)
    final_payment_status_code = db.Column(
        db.String,
        db.ForeignKey('application_document_type.application_document_code'),
        nullable=False)

    interim_actual_est_cost = db.Column(db.Numeric(14, 2))
    final_actual_est_cost = db.Column(db.Numeric(14, 2))

    interim_total_hours_worked_to_date = db.Column(db.Integer)
    final_total_hours_worked_to_date = db.Column(db.Integer)

    interim_total_people_employed_to_date = db.Column(db.Integer)
    final_total_people_employed_to_date = db.Column(db.Integer)

    interim_eoc_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)
    final_eoc_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_id} {self.application_guid} {self.work_id}>'

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active=True).all()
