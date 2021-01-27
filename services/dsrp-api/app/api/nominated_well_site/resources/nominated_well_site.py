from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api, db
from app.api.nominated_well_site.response_models import NOMINATED_WELL_SITE
from app.api.nominated_well_site.models.nominated_well_site import NominatedWellSite
from app.api.application.models.application import Application


class NominatedWellSiteListResource(Resource):
    @api.doc(description='Get all nominated well sites')
    @api.marshal_with(NOMINATED_WELL_SITE, code=200, envelope='records')
    def get(self):
        wa_number = request.args.get('well_auth_number', type=int)
        operator_id = request.args.get('operator_id', None)
        application_guid = request.args.get('application_guid', None)

        wells = []

        if operator_id:
            wells = NominatedWellSite.find_by_operator_id(operator_id)

        if wa_number:
            wells = [NominatedWellSite.find_by_wa_number(wa_number)]

        if application_guid:

            application = Application.find_by_guid(application_guid)
            application_wells = [
                int(x['details']['well_authorization_number'])
                for x in application.json['well_sites']
            ]

            wells = NominatedWellSite.query.filter(
                NominatedWellSite.wa_number.in_(application_wells)).all()

        return wells
