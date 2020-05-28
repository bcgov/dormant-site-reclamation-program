import uuid
import os
from datetime import datetime
from flask_restplus import Resource
from flask import Response, stream_with_context, current_app

from flask import request, current_app, send_file, make_response, jsonify
from werkzeug.exceptions import BadRequest, NotFound, Conflict, RequestEntityTooLarge, InternalServerError

from app.extensions import api, cache
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application

from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.application.models.application_document import ApplicationDocument
from app.api.services.object_store_storage_service import ObjectStoreStorageService





class DocumentDownloadResource(Resource, UserMixin):
    @api.doc(description='Retrieve a file from document storage with token')
    def get(self):
        token_guid = request.args.get('token', '')
        attachment = request.args.get('as_attachment', None)
        token_data = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))
        file_resp = None

        if not token_data:
            raise BadRequest('Valid token required for download')

        #GENERATION TOKEN
        if token_data.get('generation', False):
            application = Application.find_by_guid(token_data['application_guid'])
            template_path = token_data['template_path']
            docgen_resp = DocumentGeneratorService.generate_document_and_stream_response(
            template_path, application._doc_gen_json)
            # Return the generated document

            headers = dict(docgen_resp.headers)
            headers['Content-Disposition']=f'attachment; filename=shared_cost_agreement_{application.company_name}_draft.docx'

            file_resp = Response(
                stream_with_context(docgen_resp.iter_content(chunk_size=2048)),
                headers=dict(docgen_resp.headers))
            
        #S3 Download Token
        else:
            app_doc = ApplicationDocument.query.filter_by(application_document_guid=token_data).first()
            if not app_doc:
                raise NotFound('Could not find the document corresponding to the token')
            if attachment is not None:
                attach_style = True if attachment == 'true' else False
            else:
                attach_style = '.pdf' not in app_doc.document_name.lower()

            file_resp = ObjectStoreStorageService().download_file(
                path=app_doc.object_store_path,
                display_name=app_doc.document_name,
                as_attachment=attach_style)

        return file_resp
