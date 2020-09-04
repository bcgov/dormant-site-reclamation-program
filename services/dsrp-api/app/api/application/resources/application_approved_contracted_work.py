from flask_restplus import Resource
from werkzeug.exceptions import NotFound
from flask import request, current_app

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.constants import DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, REVIEW_DEADLINE_NOT_APPLICABLE, REVIEW_DEADLINE_PAID
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.helpers import apply_pagination_to_records
from app.api.utils.access_decorators import requires_otp_or_admin


class ApplicationApprovedContractedWorkResource(Resource, UserMixin):
    @requires_otp_or_admin
    @api.doc(
        description=
        'Get the information required for an applicant to manage the approved contracted work payment information on their application.'
    )
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application.contracted_work('APPROVED', True)


class ApplicationApprovedContractedWorkListResource(Resource, UserMixin):
    @api.doc(
        description=
        'Get all approved contracted work item payment information on all approved applications.')
    @requires_role_admin
    def get(self):
        # Get all approved contracted work items on all approved applications
        application_id = request.args.get('application_id', type=int)
        application_guid = request.args.get('application_guid', type=str)
        company_name = request.args.get('company_name', type=str)
        all_approved_contracted_work = Application.all_approved_contracted_work(
            application_id, application_guid, company_name)

        # Get pagination/sorting query params
        page_number = request.args.get('page', DEFAULT_PAGE_NUMBER, type=int)
        page_size = request.args.get('per_page', DEFAULT_PAGE_SIZE, type=int)
        sort_field = request.args.get('sort_field', 'review_deadlines', type=str)
        sort_dir = request.args.get('sort_dir', 'asc', type=str)

        # Get filtering query params
        work_id = request.args.get('work_id', type=str)
        well_authorization_number = request.args.get('well_authorization_number', type=str)
        contracted_work_type = request.args.getlist('contracted_work_type', type=str)
        interim_payment_status_code = request.args.getlist('interim_payment_status_code', type=str)
        final_payment_status_code = request.args.getlist('final_payment_status_code', type=str)

        # Apply filtering
        records = all_approved_contracted_work
        if (work_id or well_authorization_number or contracted_work_type
                or interim_payment_status_code or final_payment_status_code):
            records = []
            for approved_work in all_approved_contracted_work:

                if work_id:
                    if approved_work['work_id'] == work_id:
                        records.append(approved_work)
                        break
                    continue

                if well_authorization_number and approved_work[
                        'well_authorization_number'] != well_authorization_number:
                    continue

                if contracted_work_type and approved_work[
                        'contracted_work_type'] not in contracted_work_type:
                    continue

                contracted_work_payment = approved_work.get('contracted_work_payment', None)

                interim_status = 'INFORMATION_REQUIRED' if not contracted_work_payment else contracted_work_payment[
                    'interim_payment_status_code']
                final_status = 'INFORMATION_REQUIRED' if not contracted_work_payment else contracted_work_payment[
                    'final_payment_status_code']

                if interim_payment_status_code and final_payment_status_code:
                    if interim_status not in interim_payment_status_code and final_status not in final_payment_status_code:
                        continue
                else:
                    if interim_payment_status_code and interim_status not in interim_payment_status_code:
                        continue
                    if final_payment_status_code and final_status not in final_payment_status_code:
                        continue

                records.append(approved_work)

        # Apply sorting
        reverse = sort_dir == 'desc'
        if sort_field == 'well_authorization_number':
            records.sort(key=lambda x: int(x[sort_field]), reverse=reverse)
        elif sort_field == 'work_id':
            records.sort(
                key=lambda x: (x['application_id'], int(x[sort_field].split('.')[1])),
                reverse=reverse)
        elif sort_field in ('application_id', 'work_id', 'contracted_work_type', 'company_name'):
            records.sort(key=lambda x: x[sort_field], reverse=reverse)
        elif sort_field in ('review_deadlines'):
            records.sort(
                key=lambda x: (x.get('contracted_work_payment') and
                               (x['contracted_work_payment'][sort_field] and (
                                   (x['contracted_work_payment'][sort_field]['interim'], x[
                                       'contracted_work_payment'][sort_field]['final'])
                                   if x['contracted_work_payment'][sort_field]['interim'] <= x[
                                       'contracted_work_payment'][sort_field]['final'] else
                                   (x['contracted_work_payment'][sort_field]['final'], x[
                                       'contracted_work_payment'][sort_field]['interim']))) or
                               (REVIEW_DEADLINE_NOT_APPLICABLE, REVIEW_DEADLINE_NOT_APPLICABLE)),
                reverse=reverse)
        elif sort_field in ('interim_payment_status_code', 'final_payment_status_code'):
            records.sort(
                key=lambda x: (x.get('contracted_work_payment') and x['contracted_work_payment'][
                    sort_field]) or 'INFORMATION_REQUIRED',
                reverse=reverse)

        # Return records with pagination applied
        return apply_pagination_to_records(records, page_number, page_size)
