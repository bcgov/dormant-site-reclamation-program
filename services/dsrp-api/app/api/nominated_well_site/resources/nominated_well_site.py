from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api, db
from app.api.nominated_well_site.response_models import NOMINATED_WELL_SITE
from app.api.nominated_well_site.models.nominated_well_site import NominatedWellSite


class NominatedWellSiteListResource(Resource):
    @api.doc(description='Get all nominated well sites')
    @api.marshal_with(NOMINATED_WELL_SITE, code=200, envelope='records')
    def get(self):
        wa_number = request.args.get('well_auth_number', type=int)
        return [NominatedWellSite.find_by_wa_number(wa_number)]
