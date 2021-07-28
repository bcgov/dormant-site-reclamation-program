from app.extensions import api
from flask_restplus import fields

COMPANY_PAYMENT_INFO = api.model(
    'CompanyPaymentInfo', {
        'company_name': fields.String,
        'company_address': fields.String,
        'po_number': fields.String,
        'po_number_2': fields.String,
        'qualified_receiver_name': fields.String,
        'expense_authority_name': fields.String,
    })
