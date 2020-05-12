from app.extensions import api
from flask_restplus import fields

WELL = api.model(
    'Well', {
        'operator_name': fields.String,
        'operator_id': fields.String,
        'well_auth_number': fields.String,
        'well_name': fields.String,
        'dormant_status': fields.String,
        'current_status' : fields.String,
        'well_dormancy_date': fields.String,
        'site_dormancy_date': fields.String,
        'site_dormancy_type': fields.String,
        'site_dormant_status': fields.String,
        'surface_location': fields.String,
        'field': fields.String,
        'abandonment_date': fields.String,
        'last_spud_date': fields.String,
        'last_rig_rels_date': fields.String,
        'last_completion_date': fields.String,
        'last_active_production_year': fields.String,
        'last_active_inj_display_year': fields.String,
        'multi_well': fields.String
    })