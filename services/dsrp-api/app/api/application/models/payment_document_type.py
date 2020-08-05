from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class PaymentDocumentType(Base, AuditMixin):
    __tablename__ = 'payment_document_type'

    payment_document_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)
    long_description = db.Column(db.String)
    active = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.payment_document_code}>'

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active=True).all()
