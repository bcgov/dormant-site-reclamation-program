from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class ContractedWorkPaymentType(Base, AuditMixin):
    __tablename__ = 'contracted_work_payment_type'

    contracted_work_payment_code = db.Column(db.String, primary_key=True)
    description = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_code}>'
