from app.extensions import api
from flask_restplus import fields

COMPANY_PAYMENT_INFO = api.model(
    'CompanyPaymentInfo', {
        'company_name': fields.String,
        'commpany_address': fields.String,
        'po_number': fields.String,
        'qualified_receiver_name': fields.String,
        'expense_authority_name': fields.String,
    })
