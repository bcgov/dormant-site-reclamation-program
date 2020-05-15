from flask_restplus import Resource
from app.extensions import api
from app.api.permit_holder.response_models import PERMIT_HOLDER
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.services.ogc_data_service import OGCDataService


class PermitHolderListResource(Resource, UserMixin):
    @api.doc(description='Get all permit holders')
    #@requires_role_view_all
    @api.marshal_with(PERMIT_HOLDER, envelope='records', code=200)
    def get(self):
        permit_holders = OGCDataService.getPermitHoldersDataFrame()
        return permit_holders.sort_values(by=['organization_name']).to_dict('records')