from werkzeug.exceptions import InternalServerError

from app.api.application.models.payment_document import PaymentDocument
from app.api.services.email_service import EmailService


def action_first_pay_approved(application):
    create_payment_document(application, 'FIRST_PRF')


def create_payment_document(application, payment_document_code):
    # Create the PRF document
    try:
        doc = PaymentDocument(application=application, payment_document_code=payment_document_code)
    except Exception as e:
        raise InternalServerError(f'Failed to create the PRF: {e}')

    # Send the PRF document
    try:
        with EmailService() as es:
            es.send_payment_document_to_finance(doc)
    except Exception as e:
        raise InternalServerError(f'Failed to send the PRF: {e}')

    doc.save()
