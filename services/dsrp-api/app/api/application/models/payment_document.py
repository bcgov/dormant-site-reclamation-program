import uuid

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class PaymentDocument(AuditMixin, Base):
    """
    Local ledger of PRF files in S3 object store and their business relationship
    """
    __tablename__ = 'payment_document'

    class _ModelSchema(Base._ModelSchema):
        document_guid = fields.String(dump_only=True)

    document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('application.guid'))
    document_name = db.Column(db.String)
    object_store_path = db.Column(db.String, nullable=False)

    upload_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    payment_document_type_code = db.Column(
        db.String, db.ForeignKey('payment_document_type.payment_document_code'), nullable=False)

    application = db.relationship("Application")

    @classmethod
    def find_by_application_guid(cls, application_guid):
        return cls.query.filter_by(application_guid=application_guid).filter_by(
            active_ind=True).all()

    @classmethod
    def find_by_guid(cls, application_guid, document_guid):
        return cls.query.filter_by(
            application_guid=application_guid, document_guid=document_guid,
            active_ind=True).first()
