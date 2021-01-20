from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class ApplicationDocumentType(Base, AuditMixin):
    __tablename__ = 'application_document_type'

    application_document_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    long_description = db.Column(db.String)
    active = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.application_document_code}>'

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active=True).all()

    @classmethod
    def find_by_application_document_code(cls, application_document_code):
        return cls.query.filter_by(
            application_document_code=application_document_code).one_or_none()
