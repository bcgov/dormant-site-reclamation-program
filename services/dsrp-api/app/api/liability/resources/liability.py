from flask_restplus import Resource
from flask import request
from app.extensions import api
from app.api.liability.response_models import LIABILITY
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.services.ogc_data_service import OGCDataService
from app.api.application.models.application import Application
import json


class LiabilityListResource(Resource, UserMixin):
    @api.doc(description='Get all liabilities')
    #@requires_role_view_all
    @api.marshal_with(LIABILITY, envelope='records', code=200)
    def get(self):
        liabilities = OGCDataService.getLiabilityPerWellDataFrame()

        application_guid = request.args.get('application_guid', None)

        if application_guid is not None:
            application = Application.find_by_guid(application_guid)
            application_wells = [
                int(x['details']['well_authorization_number'])
                for x in application.json['well_sites']
            ]

            liabilities = liabilities[liabilities['well_auth_number'].copy().isin(
                application_wells)]

        return liabilities.to_dict('records')