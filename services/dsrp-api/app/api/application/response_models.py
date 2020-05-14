from app.extensions import api
from flask_restplus import fields

APPLICATION = api.model(
    'Application', {
        'id': fields.Integer,
        'guid': fields.String,
        'application_status_code': fields.String,
        'submission_date': fields.DateTime,
        'json': fields.Raw
    })

PAGINATED_LIST = api.model(
    'List', {
        'current_page': fields.Integer,
        'total_pages': fields.Integer,
        'items_per_page': fields.Integer,
        'total': fields.Integer,
    })

APPLICATION_LIST = api.inherit('ApplicationList', PAGINATED_LIST, {
    'records': fields.List(fields.Nested(APPLICATION)),
})