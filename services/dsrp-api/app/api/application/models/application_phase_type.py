from sqlalchemy.schema import FetchedValue

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class ApplicationPhaseType(Base, AuditMixin):
    __tablename__ = 'application_phase_type'

    application_phase_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.application_phase_code}>'

    @classmethod
    def get_active(cls):
        return cls.query.all()

    @classmethod
    def find_by_application_phase_code(cls, application_phase_code):
        return cls.query.filter_by(application_phase_code=application_phase_code).one_or_none()
