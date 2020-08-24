import uuid

from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import NotFound, BadRequest, InternalServerError

from app.extensions import api, db, cache
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.application.models.payment_document import PaymentDocument
from app.api.application.models.payment_document_contracted_work_payment_xref import PaymentDocumentContractedWorkPaymentXref
from app.api.utils.access_decorators import requires_role_admin
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.documents.response_models import DOWNLOAD_TOKEN_MODEL
from app.api.application.response_models import PAYMENT_DOCUMENT


def validate_application_contracted_work(application, work_ids):
    if application is None:
        raise NotFound('No application was found matching the provided reference number')

    if application.application_status_code != 'FIRST_PAY_APPROVED':
        raise BadRequest('This application is not approved!')

    if not work_ids:
        raise BadRequest('No work IDs were provided!')

    for work_id in work_ids:
        contracted_work = application.find_contracted_work_by_id(work_id)
        if contracted_work is None:
            raise NotFound(f'Work ID {work_id} does not exist on this application')
        if contracted_work.get('contracted_work_status_code', None) != 'APPROVED':
            raise BadRequest(f'Work ID {work_id} is not approved!')


class PaymentDocumentListResource(Resource, UserMixin):
    @api.doc(description='Create an interim or final PRF')
    @api.marshal_with(PAYMENT_DOCUMENT, code=201)
    @requires_role_admin
    def post(self, application_guid):
        application = Application.find_by_guid(application_guid)
        work_ids = request.json['work_ids']
        validate_application_contracted_work(application, work_ids)

        payment_document_code = request.json['payment_document_code']
        if payment_document_code == 'FIRST_PRF':
            raise BadRequest(
                'First PRFs are created when an application\'s status is set to approved.')

        try:
            doc = PaymentDocument(
                application=application,
                payment_document_code=payment_document_code,
                work_ids=work_ids)
            doc.save()

        except Exception as e:
            raise BadRequest(f'Failed to create the PRF: {e}')

        return doc, 201


class PaymentDocumentResource(Resource, UserMixin):
    @api.doc(description='Generate a token to retrieve a file object storage')
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_admin
    def get(self, application_guid, document_guid):
        payment_document = PaymentDocument.find_by_guid(application_guid, document_guid)
        if not payment_document:
            raise NotFound('Application payment document not found')

        token_guid = uuid.uuid4()
        cache.set(DOWNLOAD_TOKEN(token_guid), {'document_guid': document_guid}, TIMEOUT_5_MINUTES)
        return {'token_guid': token_guid}

    @api.doc(description='Soft-deletes the payment document')
    @requires_role_admin
    def delete(self, application_guid, document_guid):
        payment_document = PaymentDocument.find_by_guid(application_guid, document_guid)
        if not payment_document:
            raise NotFound('Application payment document not found')

        payment_document.soft_delete()
        return None, 204
