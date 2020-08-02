import json
import uuid

from flask import current_app
from werkzeug.exceptions import BadGateway, InternalServerError

from app.extensions import db
from app.api.application.models.payment_document import PaymentDocument
from app.api.services.object_store_storage_service import ObjectStoreStorageService


def determine_application_status_change_action(application):
    """Performs various actions according to the status of the application."""

    most_recent_status_change = application.status_changes[0] if application.status_changes and len(
        application.status_changes) > 0 else None
    if not most_recent_status_change:
        return

    status = most_recent_status_change.application_status_code
    current_app.logger.info(f'status: {most_recent_status_change}')
    if status == 'FIRST_PAY_APPROVED':
        action_first_pay_approved(application)


# TODO: Make this functionality reusable for generating Interim and Final phase PRF documents
def action_first_pay_approved(application):
    """Changing an application's status to FIRST_PAY_APPROVED triggers the following events:\
        1) Generate and store the Phase 1 PRF document required by finance.\
        2) This document is sent via email to the required email address.
    """

    # Create the PRF file name and path
    # TODO: Use a GUID as the filename in the object store?
    # file_guid = uuid.uuid4()
    payment_document_type_code = 'FIRST_PRF'
    invoice_number = application.get_prf_invoice_number(1)
    filename = f'{invoice_number}_{payment_document_type_code.lower()}.json'

    # Create the PRF document record
    doc = None
    try:
        doc = PaymentDocument(
            document_name=filename,
            payment_document_type_code=payment_document_type_code,
            invoice_number=invoice_number)
        application.payment_documents.append(doc)
        application.save()
        db.session.refresh(doc)
    except Exception as e:
        doc.delete()
        raise InternalServerError(f'Failed to record the generated PRF: {e}')

    # Upload a file containing the PRFs data to the object store
    try:
        file_path = f'{application.guid}/prf_1/{filename}'
        object_store_path = ObjectStoreStorageService().upload_string(doc.content_json, file_path)
        doc.object_store_path = object_store_path
        doc.save()
    except Exception as e:
        doc.delete()
        raise BadGateway(f'Failed to upload generated PRF: {e}')

    # Send an email to the required address containing this PRF
    # TODO: Implement
