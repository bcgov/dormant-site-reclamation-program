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
    "ApplicationDocument", {
        'application_document_guid': fields.String,
        'document_name': fields.String,
        'upload_date': fields.Date,
    })

APPLICATION_DOCUMENT_LIST = api.model(
    "ApplicationDocumentList", {'documents': fields.List(fields.Nested(APPLICATION_DOCUMENT))})

APPLICATION = api.model(
    'Application', {
        'id': fields.Integer,
        'guid': fields.String,
        'application_status_code': fields.String,
        'submission_date': fields.DateTime,
        'json': fields.Raw,
        'review_json': fields.Raw,
        'documents': fields.List(fields.Nested(APPLICATION_DOCUMENT))
    })

APPLICATION_LIST = api.inherit('ApplicationList', PAGINATED_LIST,
                               {'records': fields.List(fields.Nested(APPLICATION))})

APPLICATION_SUMMARY = api.model(
    'ApplicationSummary', {
        'id': fields.Integer,
        'guid': fields.String,
        'application_status_code': fields.String,
        'submission_date': fields.DateTime
    })