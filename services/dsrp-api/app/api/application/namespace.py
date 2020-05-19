from flask_restplus import Namespace

from app.api.application.resources.application import ApplicationResource, ApplicationListResource
from app.api.application.resources.application_document import ApplicationDocumentListResource
from app.api.application.resources.gen_application_docs import GenerateApplicationDocumentResource

api = Namespace('application', description='Application endpoints')

api.add_resource(ApplicationListResource, '')
api.add_resource(ApplicationDocumentListResource, '/documents')

api.add_resource(ApplicationResource, '/<string:application_guid>')
api.add_resource(GenerateApplicationDocumentResource,
                 '/<string:application_guid>/generate-doc/<string:document_type>')
