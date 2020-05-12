from app.extensions import api
from flask_restplus import fields

PERMIT_HOLDER = api.model(
    'PermitHolder', {
        'operator_id': fields.Integer,
        'organization_name': fields.String,
        'phone_num': fields.String,
        'address_line_1': fields.String,
        'address_line_2': fields.String,
        'city': fields.String,
        'province': fields.String,
        'postal_code': fields.String,
        'country': fields.String
    })
