from sqlalchemy.dialects.postgresql import UUID

from app.extensions import db
from app.api.utils.models_mixins import Base


class PaymentDocumentContractedWorkPaymentXref(Base):
    __tablename__ = 'payment_document_contracted_work_payment_xref'

    document_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('payment_document.document_guid'), primary_key=True)
    work_id = db.Column(
        db.String, db.ForeignKey('contracted_work_payment.work_id'), primary_key=True)
