from app.extensions import api
from flask_restplus import fields

APPLICATION = api.model(
    'Application', {
        'application_id': fields.Integer,
        'application_guid': fields.String,
        'application_status_code': fields.String,
        'reference_number': fields.String,
        'submission_date': fields.DateTime
    })
