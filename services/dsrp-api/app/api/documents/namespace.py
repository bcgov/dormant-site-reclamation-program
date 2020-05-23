from flask_restplus import Namespace

from app.api.documents.resources.download import DocumentDownloadResource

api = Namespace('documents', description='Application endpoints')

api.add_resource(DocumentDownloadResource, '/')
