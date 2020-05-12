from app.extensions import api
from flask_restplus import fields

LIABILITY = api.model(
    'Liability', {
        'well_auth_number': fields.Integer,
        'well_name': fields.String,
        'operator_name': fields.String,
        'ad_number': fields.String,
        'mode_code': fields.String,
        'ops_type' : fields.String,
        'deemed_asset': fields.String,
        'abandonment_liability': fields.String,
        'assessment_liability': fields.String,
        'remediation_liability': fields.String,
        'reclamation_liability': fields.String,
        'total_liability': fields.String
    })