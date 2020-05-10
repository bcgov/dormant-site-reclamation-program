import uuid
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from marshmallow import fields, validate

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.utils.field_template import FieldTemplate


class Applications(Base, AuditMixin):
    __tablename__ = "application"

    class _ModelSchema(Base._ModelSchema):
        application_id = fields.Integer(dump_only=True)
        application_guid = fields.String(dump_only=True)

    application_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(
        UUID(as_uuid=True), nullable=False, unique=True, server_default=FetchedValue())
    submission_date = db.Column(db.DateTime)
    reference_number = db.Column(db.String)

    def __repr__(self):
        return '<Application %r>' % self.application_guid

    @classmethod
    def get_all(cls):
        return cls.query.all()

    @classmethod
    def find_by_application_guid(cls, bond_guid):
        return cls.query.filter_by(application_guid=application_guid).first()
