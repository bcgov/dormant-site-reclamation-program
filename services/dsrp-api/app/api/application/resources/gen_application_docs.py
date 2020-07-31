import os, uuid

from flask_restplus import Resource
from app.extensions import api, cache
from werkzeug.exceptions import NotFound

from app.api.utils.access_decorators import requires_role_view_all, requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.services.document_generator_service import get_template_file_path, DOCUMENT_TYPE_FILE_MAP
from app.api.application.models.application import Application


class GenerateApplicationDocumentResource(Resource, UserMixin):
    @api.doc(description='Generate a document of a specific type for a given application')
    @requires_role_admin
    def get(self, application_guid, document_type):
        application = Application.find_by_guid(application_guid)
        if not application:
            raise NotFound('No application was found matching the provided reference number')
        if document_type not in DOCUMENT_TYPE_FILE_MAP.keys():
            raise NotFound(f'Document type "{document_type}" not found')

        template_path = get_template_file_path(document_type)
        if not os.path.isfile(template_path):
            raise Exception(f'Template file not found: {template_path}')

        token_data = {
            'template_path': template_path,
            'application_guid': str(application_guid),
            'generation': True
        }
        token_guid = str(uuid.uuid4())
        cache.set(DOWNLOAD_TOKEN(token_guid), token_data, TIMEOUT_5_MINUTES)

        return {'token_guid': token_guid}