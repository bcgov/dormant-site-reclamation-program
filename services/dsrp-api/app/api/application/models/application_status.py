from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


#'NOT_STARTED', 'IN_PROGRESS', 'WAIT_FOR_DOCS', 'DOC_SUBMITTED', 'FIRST_PAY_APPROVED','NOT_APPROVED','WITHDRAWN'
class ApplicationStatus(Base, AuditMixin):
    __tablename__ = "application_status"

    application_status_code = db.Column(db.String, nullable=False, primary_key=True)
    description = db.Column(db.String, nullable=False)
    long_description = db.Column(db.String)
    active = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.application_status_code}>'

    @classmethod
    def get_active(cls):
        return cls.query.filter_by(active=True).all()

    @classmethod
    def find_by_application_status_code(cls, application_status_code):
        return cls.query.filter_by(application_status_code=application_status_code).first()
