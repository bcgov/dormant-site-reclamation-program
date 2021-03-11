from werkzeug.exceptions import InternalServerError

from app.api.application.models.payment_document import PaymentDocument


def action_first_pay_approved(application):
    try:
        doc = PaymentDocument(application=application, payment_document_code='FIRST_PRF')
        doc.save()
    except Exception as e:
        raise InternalServerError(f'Failed to create the PRF: {e}')
