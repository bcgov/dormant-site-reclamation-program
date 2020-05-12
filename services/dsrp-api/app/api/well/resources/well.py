from flask_restplus import Resource
from flask import request
from app.extensions import api
from app.api.well.response_models import WELL
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.services.ogc_data_service import OGCDataService

class WellListResource(Resource, UserMixin):
    @api.doc(description='Get all wells')
    #@requires_role_view_all
    @api.marshal_with(WELL, envelope='records', code=200)
    def get(self):
        operator_id = request.args.get('operator_id', None)

        wells = OGCDataService.getDormantWellsDataFrame()

        if operator_id:
            return wells[wells['operator_id']== int(operator_id)].to_dict('records')

        return wells.to_dict('records')