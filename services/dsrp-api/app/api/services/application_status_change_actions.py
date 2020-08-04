import json
import uuid

from flask import current_app
from werkzeug.exceptions import BadGateway, InternalServerError

from app.extensions import db
from app.api.application.models.payment_document import PaymentDocument
from app.api.services.email_service import EmailService


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

    # Create the PRF document
    try:
        doc = PaymentDocument(application=application, payment_document_code='FIRST_PRF')
    except Exception as e:
        raise InternalServerError(f'Failed to create the PRF: {e}')

    # Send the PRF document
    try:
        with EmailService() as es:
            es.send_payment_document_to_finance(doc)
    except Exception as e:
        raise InternalServerError(f'Failed to send the PRF: {e}')
