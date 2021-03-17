from datetime import datetime
from flask_restplus import Resource
from flask import current_app, request
from werkzeug.exceptions import NotFound, BadRequest, Unauthorized

from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.company_payment_info.models.company_payment_info import CompanyPaymentInfo

from app.api.utils.access_decorators import ADMIN
from app.api.utils.access_decorators import requires_otp_or_admin
from app.api.utils.include.user_info import User


class CompanyPaymentInfoModify(Resource, UserMixin):
    @requires_otp_or_admin
    def put(self, cpi_name):
        response_code = 200

        # TODO: validate domain data needed?

        # Check if already exists
        company_payment_info = CompanyPaymentInfo.find_by_company_name(cpi_name)
        new_info = request.json
        if not company_payment_info:
            response_code = 201
            company_payment_info = CompanyPaymentInfo(
                company_name=new_info['company_name'],
                commpany_address=new_info['company_address'],
                po_number=new_info['po_number'],
                qualified_receiver_name=new_info['qualified_receiver_name'],
                expense_authority_name=new_info['expense_authority_name'],
            )
        else:
            response_code = 200
            company_payment_info.commpany_address = new_info['company_address']
            company_payment_info.po_number = new_info['po_number']
            company_payment_info.qualified_receiver_name = new_info['qualified_receiver_name']
            company_payment_info.expense_authority_name = new_info['expense_authority_name']

        company_payment_info.save()

        return '', response_code
