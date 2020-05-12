from flask_restplus import Namespace

from app.api.application.resources.application import ApplicationResource, ApplicationListResource

api = Namespace('application', description='Application endpoints')

api.add_resource(ApplicationResource, '/<string:application_guid>')
api.add_resource(ApplicationListResource, '')