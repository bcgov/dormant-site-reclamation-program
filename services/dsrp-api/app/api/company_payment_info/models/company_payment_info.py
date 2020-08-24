from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin


class CompanyPaymentInfo(Base, AuditMixin):
    __tablename__ = "company_payment_info"

    company_name = db.Column(db.String, primary_key=True)
    company_address = db.Column(db.String, nullable=False)
    po_number = db.Column(db.String, nullable=False)
    qualified_receiver_name = db.Column(db.String, nullable=False)
    expense_authority_name = db.Column(db.String, nullable=False)

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.company_name}>'

    @classmethod
    def find_by_company_name(cls, company_name):
        return cls.query.filter_by(company_name=company_name).one()
