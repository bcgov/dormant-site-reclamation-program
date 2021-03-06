from app.extensions import api
from flask_restplus import fields

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer
    })

APPLICATION_STATUS = api.model(
    'ApplicationStatus', {
        'application_status_code': fields.String,
        'description': fields.String,
        'long_description': fields.String
    })

APPLICATION_DOCUMENT = api.model(
    'ApplicationDocument', {
        'application_document_guid': fields.String,
        'document_name': fields.String,
        'application_document_code': fields.String,
        'upload_date': fields.DateTime
    })

APPLICATION_DOCUMENT_SMALL = api.model('ApplicationDocument', {
    'application_document_guid': fields.String,
    'document_name': fields.String
})

APPLICATION_DOCUMENT_TYPE = api.model(
    'ApplicationDocumentType', {
        'application_document_code': fields.String,
        'description': fields.String,
        'long_description': fields.String
    })

APPLICATION_PHASE_TYPE = api.model('ApplicationPhaseType', {
    'application_phase_code': fields.String,
    'description': fields.String
})

PAYMENT_DOCUMENT_TYPE = api.model(
    'PaymentDocumentType', {
        'payment_document_code': fields.String,
        'description': fields.String,
        'long_description': fields.String
    })

PAYMENT_DOCUMENT = api.model(
    'PaymentDocument', {
        'document_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.DateTime,
        'payment_document_code': fields.String,
        'invoice_number': fields.String,
        'create_user': fields.String
    })

APPLICATION_DOCUMENT_LIST = api.model(
    'ApplicationDocumentList', {'documents': fields.List(fields.Nested(APPLICATION_DOCUMENT))})

APPLICATION = api.model(
    'Application', {
        'id': fields.Integer,
        'guid': fields.String,
        'application_status_code': fields.String,
        'submission_date': fields.DateTime,
        'json': fields.Raw,
        'review_json': fields.Raw,
        'estimated_cost_overrides': fields.Raw,
        'documents': fields.List(fields.Nested(APPLICATION_DOCUMENT, skip_none=True)),
        'payment_documents': fields.List(fields.Nested(PAYMENT_DOCUMENT, skip_none=True)),
        'edit_note': fields.String,
        'application_phase_code': fields.String
    })

APPLICATION_LIST = api.inherit('ApplicationList', PAGINATED_LIST,
                               {'records': fields.List(fields.Nested(APPLICATION))})

APPLICATION_SUMMARY = api.model(
    'ApplicationSummary', {
        'id': fields.Integer,
        'guid': fields.String,
        'application_phase_code': fields.String,
        'application_status_code': fields.String,
        'submission_date': fields.DateTime,
        'company_name': fields.String,
        'applicant_name': fields.String
    })
