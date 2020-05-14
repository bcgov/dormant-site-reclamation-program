import uuid

from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class ApplicationDocument(AuditMixin, Base):
    __tablename__ = 'application_document'

    class _ModelSchema(Base._ModelSchema):
        application_document_id = fields.Integer(dump_only=True)
        application_document_guid = fields.String(dump_only=True)

    application_document_id = db.Column(db.Integer,
                                        nullable=False,
                                        unique=True,
                                        server_default=FetchedValue())
    application_document_guid = db.Column(UUID(as_uuid=True),
                                          primary_key=True,
                                          server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('application.guid'))
    document_manager_guid = db.Column(UUID(as_uuid=True))
    document_name = db.Column(db.String(255), nullable=False)

    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())
    upload_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)

    @classmethod
    def find_by_application_guid(cls, application_guid):
        return cls.query.filter_by(application_guid=application_guid).filter_by(
            active_ind=True).all()

    @classmethod
    def find_by_application_document_guid(cls, application_document_guid):
        return cls.query.filter_by(application_document_guid=application_document_guid).filter_by(
            active_ind=True).first()
