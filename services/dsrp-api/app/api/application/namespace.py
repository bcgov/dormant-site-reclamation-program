from flask_restplus import Namespace

from app.api.application.resources.application import ApplicationResource, ApplicationListResource, ApplicationReviewResource
from app.api.application.resources.application_document import ApplicationDocumentListResource, ApplicationDocumentResource
from app.api.application.resources.application_status import ApplicationStatusListResource
from app.api.application.resources.application_summary import ApplicationSummaryResource
from app.api.application.resources.gen_application_docs import GenerateApplicationDocumentResource
from app.api.application.resources.application_payment_document import ApplicationPaymentDocumentResource
from app.api.application.resources.application_approved_contracted_work import ApplicationApprovedContractedWorkResource

api = Namespace('application', description='Application endpoints')

api.add_resource(ApplicationListResource, '')
api.add_resource(ApplicationResource, '/<string:application_guid>')
api.add_resource(ApplicationSummaryResource, '/<string:application_guid>/summary')
api.add_resource(ApplicationStatusListResource, '/<string:application_guid>/status')
api.add_resource(ApplicationReviewResource, '/<string:application_guid>/review')
api.add_resource(GenerateApplicationDocumentResource,
                 '/<string:application_guid>/generate-doc/<string:document_type>')
api.add_resource(ApplicationDocumentResource,
                 '/<string:application_guid>/documents/<string:document_guid>')
api.add_resource(ApplicationDocumentListResource, '/<string:application_guid>/documents')
api.add_resource(ApplicationPaymentDocumentResource,
                 '/<string:application_guid>/payment-doc/<string:document_guid>')
api.add_resource(ApplicationApprovedContractedWorkResource,
                 '/<string:application_guid>/approved-contracted-work')
