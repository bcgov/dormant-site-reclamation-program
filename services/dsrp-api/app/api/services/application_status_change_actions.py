import json
import uuid

from flask import current_app
from werkzeug.exceptions import BadRequest, BadGateway, InternalServerError

from app.api.company_payment_info.models import CompanyPaymentInfo
from app.api.application.models.payment_document import PaymentDocument
from app.api.services.object_store_storage_service import ObjectStoreStorageService


def determine_application_status_change_action(application):
    """Performs various actions according to the status of the application."""

    most_recent_status_change = application.status_changes[0] if application.status_changes and len(
        application.status_changes) > 0 else None
    if not most_recent_status_change:
        return

    status = most_recent_status_change.application_status_code
    if status == 'FIRST_PAY_APPROVED':
        action_first_pay_approved(application)


# TODO: Make this functionality reusable for generating Interim and Final phase PRF documents
def action_first_pay_approved(application):
    """Changing an application's status to FIRST_PAY_APPROVED triggers the following events:\
        1) Generate and store the Phase 1 PRF document required by finance.\
        2) This document is sent via email to the required email address.
    """

    # The application must have at least one reviewed contracted work item
    # TODO: Check to ensure that they have at least one APPROVED contracted work item?
    if not application.review_json:
        raise BadRequest('Application has no approved contracted work items')

    # Get critical company payment info for generating the PRF
    company_info = CompanyPaymentInfo.find_by_company_name(application.company_name)
    if not company_info:
        raise BadRequest('Essential company payment data is missing')

    # Get data used in the PRF
    agreement_number = application.agreement_number
    supplier_name = application.company_name
    supplier_address = company_info.company_address
    po_number = company_info.po_number
    qualified_receiver_name = company_info.qualified_receiver_name
    expense_authority_name = company_info.expense_authority_name
    amount = application.calc_prf_phase_one_amount()
    invoice_number = application.get_prf_invoice_number(1)
    unique_id = application.get_prf_unique_id(1)

    # Create the PRF file content
    file_content = f'\
    {invoice_number}\n\
    {supplier_name}\n\
    {supplier_address}\n\
    {po_number}\n\
    {qualified_receiver_name}\n\
    {expense_authority_name}\n\
    {agreement_number},{unique_id},{amount}\n'

    # Create the PRF file name and path
    # TODO: Use a GUID as the filename in the object store?
    # file_guid = uuid.uuid4()
    filename = f'{invoice_number}_prf_first.csv'
    file_path = f'{application.guid}/prf_1/{filename}'

    # Upload the PRF file to the object store
    object_store_path = None
    try:
        object_store_path = ObjectStoreStorageService().upload_string(file_content, file_path)
    except Exception as e:
        raise BadGateway(f'Failed to upload generated PRF: {e}')

    # Create a payment document record for this PRF and associate it with the application
    try:
        doc = PaymentDocument(
            document_name=filename,
            object_store_path=object_store_path,
            payment_document_type_code='FIRST_PRF',
            invoice_number=invoice_number)
        application.payment_documents.append(doc)
        application.save()
    except Exception as e:
        raise InternalServerError(f'Failed to record the generated PRF: {e}')

    # Send an email to the required address containing this PRF
    # TODO: Implement
