from flask_restplus import Namespace

from app.api.application.resources.application import ApplicationResource, ApplicationListResource, ApplicationReviewResource
from app.api.application.resources.application_document import ApplicationDocumentListResource, ApplicationDocumentResource

api = Namespace('application', description='Application endpoints')

api.add_resource(ApplicationResource, '/<string:application_guid>')
api.add_resource(ApplicationDocumentResource,
                 '/<string:application_guid>/documents/<string:document_guid>')
api.add_resource(ApplicationListResource, '')
api.add_resource(ApplicationDocumentListResource, '/<string:application_guid>/documents')
api.add_resource(ApplicationReviewResource, '/<string:application_guid>/review')
