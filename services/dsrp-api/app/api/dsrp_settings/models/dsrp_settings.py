import uuid

from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base


class DSRPSettings(AuditMixin, Base):
    __tablename__ = 'dsrp_settings'

    id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    setting = db.Column(db.String, nullable=False)
    setting_value = db.Column(db.Boolean, nullable=False)

    @classmethod
    def find_by_setting(cls, setting):
        return cls.query.filter_by(setting=setting).one()

    @classmethod
    def get_all(cls):
        return cls.query.all()