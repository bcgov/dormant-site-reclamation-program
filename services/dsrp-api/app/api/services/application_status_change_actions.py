from werkzeug.exceptions import InternalServerError

from app.api.application.models.payment_document import PaymentDocument


def action_first_pay_approved(application):
    create_payment_document(application, 'FIRST_PRF')


def create_payment_document(application, payment_document_code):
    try:
        doc = PaymentDocument(application=application, payment_document_code=payment_document_code)
        doc.save()
    except Exception as e:
        raise InternalServerError(f'Failed to create the PRF: {e}')
