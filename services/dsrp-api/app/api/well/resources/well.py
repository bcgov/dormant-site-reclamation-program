from flask_restplus import Resource
from flask import request
from app.extensions import api
from app.api.well.response_models import WELL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.services.ogc_data_service import OGCDataService
from app.api.application.models.application import Application
import json


class WellListResource(Resource, UserMixin):
    @api.doc(description='Get all wells')
    #@requires_role_view_all
    @api.marshal_with(WELL, envelope='records', code=200)
    def get(self):
        operator_id = request.args.get('operator_id', None)
        well_auth_number = request.args.get('well_auth_number', None)
        application_guid = request.args.get('application_guid', None)

        wells = OGCDataService.getDormantWellsDataFrame()

        if operator_id:
            wells = wells[wells['operator_id'] == int(operator_id)]

        if well_auth_number:
            wells = wells[wells['well_auth_number'] == int(well_auth_number)]

        if application_guid:
            application = Application.find_by_guid(application_guid)
            application_wells = [
                int(x['details']['well_authorization_number'])
                for x in application.json['well_sites']
            ]

            wells = wells[wells['well_auth_number'].copy().isin(application_wells)]

        return wells.to_dict('records')