from flask_restplus import Namespace

from app.api.authorization.resources.authorization import AuthorizationResource

api = Namespace('authorization', description='OTL/OTP authorization endpoints')

api.add_resource(AuthorizationResource, '')