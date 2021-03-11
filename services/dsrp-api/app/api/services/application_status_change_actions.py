import io, cgi

from werkzeug.exceptions import InternalServerError

from app.api.services.document_generator_service import DocumentGeneratorService, get_template_file_path
from app.api.application.models.payment_document import PaymentDocument
from app.api.services.email_service import EmailService


def action_first_pay_approved(application):
    try:
        doc = PaymentDocument(application=application, payment_document_code='FIRST_PRF')
        doc.save()
    except Exception as e:
        raise InternalServerError(f'Failed to create the PRF: {e}')


def action_amendment_started(application):
    try:
        doc = DocumentGeneratorService.generate_document_and_stream_response(
            get_template_file_path('shared-cost-agreement-amendment'),
            application.shared_cost_agreement_amendment_template_json, 'docx')
        value, params = cgi.parse_header(doc.headers['content-disposition'])
        filename = params['filename']
        attachment = io.BytesIO(doc.content)

        with EmailService() as es:
            es.send_shared_cost_agreement_amendment_document(application, attachment, filename)

    except Exception as e:
        raise InternalServerError(
            f'Failed to create and email the Shared Cost Agreement Amendment: {e}')
