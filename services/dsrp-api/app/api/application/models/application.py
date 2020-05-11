import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate

from .application_status import ApplicationStatus

class Application(Base, AuditMixin):
    __tablename__ = "application"

    class _ModelSchema(Base._ModelSchema):
        id = fields.Integer(dump_only=True)
        guid = fields.String(dump_only=True)
        submission_date = fields.String(dump_only=True)
        application_status_code = FieldTemplate(field=fields.String, one_of='ApplicationStatus')

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    guid = db.Column(
        UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())
    application_status_code = db.Column(db.String, db.ForeignKey('application_status.application_status_code'), nullable=False, server_default=FetchedValue())
    submission_date = db.Column(db.DateTime, nullable=False, server_default=FetchedValue())
    json = db.Column(db.String)

    def __repr__(self):
        return f'<{self.__name__} {self.guid}>'

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_guid(cls, guid):
        return cls.query.filter_by(guid=guid).first()