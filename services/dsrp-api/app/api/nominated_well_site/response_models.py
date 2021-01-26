from app.extensions import api
from flask_restplus import fields

NOMINATED_WELL_SITE = api.model(
    'NominatedWellSiteListResource', {
        'operator_name': fields.String(attribute='operator'),
        'operator_id': fields.Integer(attribute='ba_id'),
        'well_auth_number': fields.Integer(attribute='wa_number'),
        'well_name': fields.String,
        'dormant_status': fields.String(attribute='well_dormant_status'),
        'current_status': fields.String(attribute='current_status'),
        'well_dormancy_date': fields.DateTime,
        'site_dormancy_date': fields.DateTime,
        'site_dormancy_type': fields.String,
        'site_dormant_status': fields.String,
        'surface_location': fields.String,
        'field': fields.String,
        'abandonment_date': fields.DateTime,
        'last_spud_date': fields.DateTime,
        'last_active_production_year': fields.DateTime(attribute='last_active_production_yr'),
        'wellsite_dormancy_declaration_date': fields.DateTime,
        'multi_well': fields.String
    })
