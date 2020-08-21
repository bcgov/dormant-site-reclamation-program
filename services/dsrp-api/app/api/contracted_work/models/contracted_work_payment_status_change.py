from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


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

    contracted_work_payment = db.relationship('ContractedWorkPayment')
    contracted_work_payment_status = db.relationship('ContractedWorkPaymentStatus')
    contracted_work_payment_type = db.relationship('ContractedWorkPaymentType')

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_status_change_id}>'
