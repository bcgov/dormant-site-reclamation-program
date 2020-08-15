from flask_restplus import Resource
from flask import current_app, request
from werkzeug.exceptions import NotFound, BadRequest, Unauthorized

from app.extensions import jwt
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.application.models.application_document import ApplicationDocument
from app.api.contracted_work.models.contracted_work_payment import ContractedWorkPayment
from app.api.utils.access_decorators import ADMIN


def validate_application_contracted_work(application, work_id):
    if application is None:
        raise NotFound('No application was found matching the provided reference number')

    contracted_work = application.find_contracted_work_by_id(work_id)
    if contracted_work is None:
        raise NotFound(
            'No contracted work matching the provided work ID was found on that application')

    if contracted_work.get('contracted_work_status_code', None) != 'APPROVED':
        raise BadRequest('This contracted work item is not approved!')


class ContractedWorkPaymentInterim(Resource, UserMixin):
    def put(self, application_guid, work_id):
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if payment is None:
            payment = ContractedWorkPayment.create(application_guid, work_id)
        else:
            if payment.interim_payment_status_code != 'INFORMATION_REQUIRED' and not jwt.validate_roles(
                [ADMIN]):
                raise BadRequest(
                    'Applicants can only update information for work items with the status Information Required'
                )

            payment.interim_eoc_document.active_ind = False

        current_app.logger.info(f'payment: {payment}')

        interim_payment_info = request.json
        payment.interim_payment_status_code = 'READY_FOR_REVIEW'
        payment.interim_total_hours_worked_to_date = interim_payment_info[
            'interim_total_hours_worked_to_date']
        payment.interim_number_of_workers = interim_payment_info['interim_number_of_workers']
        payment.interim_actual_cost = interim_payment_info['interim_actual_cost']

        interim_eoc = interim_payment_info['interim_eoc'][0]
        doc = ApplicationDocument(
            document_name=interim_eoc['filename'],
            object_store_path=interim_eoc['id'],
            application_document_code='INTERIM_EOC')
        application.documents.append(doc)
        application.save()
        payment.interim_eoc_application_document_guid = doc.application_document_guid

        payment.save()
        return '', 200
