from datetime import datetime
from flask_restplus import Resource
from flask import current_app, request
from werkzeug.exceptions import NotFound, BadRequest, Unauthorized

from app.extensions import api
from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.company_payment_info.response_models import COMPANY_PAYMENT_INFO
from app.api.company_payment_info.models.company_payment_info import CompanyPaymentInfo

from app.api.utils.access_decorators import ADMIN
from app.api.utils.access_decorators import requires_otp_or_admin
from app.api.utils.include.user_info import User


class CompanyPaymentInfoResource(Resource, UserMixin):
    @api.doc(description='Create a new company payment info record')
    @api.marshal_with(COMPANY_PAYMENT_INFO, code=201)
    @requires_role_admin
    def post(self):
        new_info = request.json
        company_payment_info = CompanyPaymentInfo(
            company_name=new_info['company_name'],
            company_address=new_info['company_address'],
            po_number=new_info['po_number'],
            qualified_receiver_name=new_info['qualified_receiver_name'],
            expense_authority_name=new_info['expense_authority_name'],
        )
        company_payment_info.save()
        return company_payment_info

    @api.doc(description='Create a new company payment info record')
    @api.marshal_with(COMPANY_PAYMENT_INFO, code=200)
    @requires_role_admin
    def put(self, company_name):
        company_payment_info = CompanyPaymentInfo.find_by_company_name(company_name)
        new_info = request.json
        company_payment_info.company_address = new_info['company_address']
        company_payment_info.po_number = new_info['po_number']
        company_payment_info.qualified_receiver_name = new_info['qualified_receiver_name']
        company_payment_info.expense_authority_name = new_info['expense_authority_name']
        company_payment_info.save()
        return company_payment_info

    @api.doc(description='Get company payment info record')
    @api.marshal_with(COMPANY_PAYMENT_INFO, code=200)
    @requires_role_admin
    def get(self, company_name):
        company_payment_info = CompanyPaymentInfo.find_by_company_name(company_name)
        if company_payment_info is None:
            raise NotFound('No comany payment info found with that name')
        return company_payment_info


class CompanyPaymentInfoListResource(Resource, UserMixin):
    @api.doc(description='Get all company payment info records')
    @api.marshal_with(COMPANY_PAYMENT_INFO, code=200)
    @requires_role_admin
    def get(self):
        company_payment_infos = CompanyPaymentInfo.all_company_payment_info()
        return company_payment_infos
