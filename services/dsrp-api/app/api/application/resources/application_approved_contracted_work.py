from flask_restplus import Resource, marshal
from werkzeug.exceptions import NotFound
from flask import request, current_app

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.constants import PAGE_DEFAULT, PER_PAGE_DEFAULT
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.helpers import apply_pagination_to_records


class ApplicationApprovedContractedWorkResource(Resource, UserMixin):
    # TODO: Protect me with OTP
    @api.doc(
        description=
        'Get the information required for an applicant to manage the approved contracted work payment information on their application.'
    )
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application.approved_contracted_work


class ApplicationApprovedContractedWorkListResource(Resource, UserMixin):
    @api.doc(
        description=
        'Get all approved contracted work item payment information on all approved applications.')
    @requires_role_admin
    def get(self):

        # If filtering by application_id, just get that application
        application_id = request.args.get('application_id', type=int)
        approved_applications = None
        if application_id:
            approved_applications = Application.query.filter_by(
                id=application_id, application_status_code='FIRST_PAY_APPROVED').all()

        # Else, get all approved applications
        else:
            approved_applications = Application.query.filter_by(
                application_status_code='FIRST_PAY_APPROVED').all()


        # Get all approved contracted work items on those applications
        approved_applications_approved_contracted_work = [
            approved_contracted_work for application in approved_applications
            for approved_contracted_work in application.contracted_work('APPROVED')
        ]

        # Get pagination/sorting query params
        page_number = request.args.get('page', PAGE_DEFAULT, type=int)
        page_size = request.args.get('per_page', PER_PAGE_DEFAULT, type=int)
        sort_field = request.args.get('sort_field', 'application_id', type=str)
        sort_dir = request.args.get('sort_dir', 'asc', type=str)

        # Get filtering query params
        work_id = request.args.get('work_id', type=str)
        well_authorization_number = request.args.get('well_authorization_number', type=str)
        contracted_work_type = request.args.getlist('contracted_work_type', type=str)
        interim_payment_status_code = request.args.getlist('interim_payment_status_code', type=str)
        final_payment_status_code = request.args.getlist('final_payment_status_code', type=str)

        # Apply filtering
        records = approved_applications_approved_contracted_work
        if (application_id or work_id or well_authorization_number or contracted_work_type
                or interim_payment_status_code or final_payment_status_code):
            records = []
            for approved_work in approved_applications_approved_contracted_work:

                if work_id:
                    if approved_work['work_id'] == work_id:
                        records.append(approved_work)
                        break
                    continue

                if application_id and approved_work['application_id'] != application_id:
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
        elif sort_field in ('application_id', 'work_id', 'contracted_work_type'):
            records.sort(key=lambda x: x[sort_field], reverse=reverse)
        elif sort_field in ('interim_payment_status_code', 'final_payment_status_code'):
            records.sort(
                key=lambda x: (x.get('contracted_work_payment') and x['contracted_work_payment'][
                    sort_field]) or 'INFORMATION_REQUIRED',
                reverse=reverse)

        # Return records with pagination applied
        return apply_pagination_to_records(records, page_number, page_size)
