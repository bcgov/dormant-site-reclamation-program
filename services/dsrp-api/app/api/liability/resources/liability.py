from flask_restplus import Resource
from app.extensions import api
from app.api.liability.response_models import LIABILITY
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.services.ogc_data_service import OGCDataService

class LiabilityListResource(Resource, UserMixin):
    @api.doc(description='Get all liabilities')
    #@requires_role_view_all
    @api.marshal_with(LIABILITY, envelope='records', code=200)
    def get(self):
        liabilities = OGCDataService.getLiabilityPerWellDataFrame()
        return liabilities.to_dict('records')