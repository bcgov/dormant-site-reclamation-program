import os

from flask import Response, stream_with_context, current_app
from flask_restplus import Resource
from app.extensions import api
from werkzeug.exceptions import BadRequest, NotFound

from app.api.utils.access_decorators import requires_role_view_all,requires_role_admin
from app.api.utils.resources_mixins import UserMixin

from app.api.services.document_generator_service import DocumentGeneratorService
from app.api.application.models.application import Application

templates_base_path = "/app/app/templates/"

document_type_file_map = {"shared-cost-agreement": "shared_cost_agreement_template.docx"}


class GenerateApplicationDocumentResource(Resource, UserMixin):
    @api.doc(description='Generate a document of a specific type for a given application')
    #TODO @requires_role_admin
    def get(self, application_guid, document_type):
        application = Application.find_by_guid(application_guid)
        if not application:
            raise NotFound(f'Application with {application_guid} not found')
        if document_type not in document_type_file_map.keys():
            raise NotFound(f'document_type of \'{document_type}\' not found')

        template_path = templates_base_path + document_type_file_map[document_type]

        if not os.path.isfile(template_path):
            raise Exception('template file not found')

        docgen_resp = DocumentGeneratorService.generate_document_and_stream_response(
            template_path, application._doc_gen_json)
        # Return the generated document
        current_app.logger.info(docgen_resp.headers)

        file_gen_resp = Response(
            stream_with_context(docgen_resp.iter_content(chunk_size=2048)),
            headers=dict(docgen_resp.headers))

        current_app.logger.info(file_gen_resp.__dict__)
        return file_gen_resp
