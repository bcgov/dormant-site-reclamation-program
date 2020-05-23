import uuid
import os
from datetime import datetime

from flask import request, current_app, send_file, make_response, jsonify
from flask_restplus import Resource, reqparse
from werkzeug.exceptions import BadRequest, NotFound, Conflict, RequestEntityTooLarge, InternalServerError

from app.extensions import api, cache
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.utils.resources_mixins import UserMixin

from app.api.application.models.application_document import ApplicationDocument
from app.api.services.object_store_storage_service import ObjectStoreStorageService


class DocumentDownloadResource(Resource, UserMixin):

    def on_get(self, req, resp):
        del(req.env['wsgi.file_wrapper'])

    @api.doc(description='Retrieve a file from document storage with token')
    def get(self):
        token_guid = request.args.get('token', '')
        attachment = request.args.get('as_attachment', None)
        doc_guid = cache.get(DOWNLOAD_TOKEN(token_guid))
        cache.delete(DOWNLOAD_TOKEN(token_guid))

        if not doc_guid:
            raise BadRequest('Valid token required for download')

        app_doc = ApplicationDocument.query.filter_by(application_document_guid=doc_guid).first()
        if not app_doc:
            raise NotFound('Could not find the document corresponding to the token')
        if attachment is not None:
            attach_style = True if attachment == 'true' else False
        else:
            attach_style = '.pdf' not in app_doc.document_name.lower()

        return ObjectStoreStorageService().download_file(
            path=app_doc.object_store_path,
            display_name=app_doc.document_name,
            as_attachment=attach_style)
