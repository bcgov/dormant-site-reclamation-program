from app.extensions import api
from flask_restplus import fields

APPLICATION = api.model(
    'Application', {
        'id': fields.Integer,
        'guid': fields.String,
        'application_status_code': fields.String,
        'submission_date': fields.DateTime,
        'json': fields.String
    })
