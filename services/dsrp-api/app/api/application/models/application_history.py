from datetime import datetime
from flask import current_app
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.schema import FetchedValue
from marshmallow import fields

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class ApplicationHistory(Base, AuditMixin):
    __tablename__ = 'application_history'

    history_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    application_id = db.Column(db.Integer, db.ForeignKey('application.id'), nullable=False)
    json = db.Column(JSONB, nullable=False)
    edit_note = db.Column(db.String)

    def __repr__(self):
        return '<ApplicationHistory %r, %r, %r>' % (self.history_id, self.json, self.edit_note)
