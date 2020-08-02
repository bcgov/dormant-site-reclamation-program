from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class ApplicationDocument(AuditMixin, Base):
    """
    Local ledger of files in S3 object store and their business relationship
    """

    __tablename__ = 'application_document'

    class _ModelSchema(Base._ModelSchema):
        application_document_guid = fields.String(dump_only=True)

    application_document_guid = db.Column(
        UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('application.guid'))
    document_name = db.Column(db.String, nullable=False)
    object_store_path = db.Column(db.String, nullable=False)

    upload_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    application = db.relationship('Application')

    @classmethod
    def find_by_guid(cls, application_guid, application_document_guid):
        return cls.query.filter_by(
            application_guid=application_guid,
            application_document_guid=application_document_guid,
            active_ind=True).first()
