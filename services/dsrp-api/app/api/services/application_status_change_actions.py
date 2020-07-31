import json
import uuid

from flask import current_app
from werkzeug.exceptions import BadRequest

from app.api.company_payment_info.models import CompanyPaymentInfo
from app.api.services.object_store_storage_service import ObjectStoreStorageService


def determine_application_status_change_action(application):
    """Performs various actions according to the status of the application."""

    most_recent_status_change = application.status_changes[
        0] if application.status_changes and len(
            application.status_changes) > 0 else None
    if not most_recent_status_change:
        return

    status = most_recent_status_change.application_status_code
    # if status == 'FIRST_PAY_APPROVED':
    action_first_pay_approved(application)


def action_first_pay_approved(application):
    """Changing an application's status to FIRST_PAY_APPROVED triggers the following events:\
        1) Generate and store the Phase 1 PRF document required by finance.\
        2) This document is sent via email to the required email address.
    """

    if not application.review_json:
        raise BadRequest('Application has no approved contracted work items')

    company_info = CompanyPaymentInfo.find_by_company_name(
        application.company_name)
    if not company_info:
        raise BadRequest('Essential company payment data is missing')

    agreement_number = application.agreement_number
    supplier_name = application.company_name
    supplier_address = company_info.company_address
    po_number = company_info.po_number
    qualified_receiver_name = company_info.qualified_receiver_name
    expense_authority_name = company_info.expense_authority_name

    amount = application.calc_prf_phase_one_amount()
    invoice_number = application.get_prf_invoice_number(1)
    unique_id = application.get_prf_unique_id(1)

    body = f'\
    {invoice_number}\n\
    {supplier_name}\n\
    {supplier_address}\n\
    {po_number}\n\
    {qualified_receiver_name}\n\
    {expense_authority_name}\n\
    {agreement_number},{unique_id},{amount}\n'

    # fileguid = uuid.uuid4()
    filename = f'{invoice_number}_prf_first.csv'
    filepath = f'{application.guid}/prf_1/{filename}'

    ObjectStoreStorageService().upload_string(body, filepath)
