from flask_restplus import Namespace

from app.api.company_payment_info.resources.company_payment_info import CompanyPaymentInfoResource, CompanyPaymentInfoListResource

api = Namespace('company-payment-info', description='Company Payment Info endpoint')

# General
api.add_resource(CompanyPaymentInfoListResource, '')
api.add_resource(CompanyPaymentInfoResource, '/<string:company_name>')
