from flask_restplus import Namespace

from app.api.liability.resources.liability import LiabilityListResource

api = Namespace('liability', description='Liability endpoints')

api.add_resource(LiabilityListResource, '')