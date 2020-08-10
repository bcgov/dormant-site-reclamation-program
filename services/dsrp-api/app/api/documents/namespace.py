from flask_restplus import Namespace

from app.api.documents.resources.download import DocumentDownloadResource
from app.api.documents.resources.download import PaymentDocumentDownloadResource

api = Namespace('documents', description='Application endpoints')

api.add_resource(DocumentDownloadResource, '/')
api.add_resource(PaymentDocumentDownloadResource, '/payment-doc')
