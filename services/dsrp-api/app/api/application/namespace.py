from flask_restplus import Namespace

from app.api.application.resources.application_resource import ApplicationResource, ApplicationListResource

api = Namespace('application', description='Application endpoints')

api.add_resource(ApplicationResource, '/application/<string:application_guid>')
api.add_resource(ApplicationListResource, '/application')