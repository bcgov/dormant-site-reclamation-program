from flask_restplus import Namespace

from app.api.permit_holder.resources.permit_holder import PermitHolderListResource

api = Namespace('permit_holder', description='Permit Holder endpoints')

api.add_resource(PermitHolderListResource, '')