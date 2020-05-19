from flask_restplus import Namespace

from app.api.application.resources.application import ApplicationResource, ApplicationListResource, ApplicationReviewResource
from app.api.application.resources.application_document import ApplicationDocumentListResource

api = Namespace('application', description='Application endpoints')

api.add_resource(ApplicationResource, '/<string:application_guid>')
api.add_resource(ApplicationListResource, '')
api.add_resource(ApplicationDocumentListResource, '/documents')
api.add_resource(ApplicationReviewResource, '/<string:application_guid>/review')
