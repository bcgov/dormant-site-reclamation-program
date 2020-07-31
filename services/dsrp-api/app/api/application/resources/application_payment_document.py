import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse, fields
from werkzeug.exceptions import BadRequest, NotFound, Unauthorized

from app.extensions import api, db, cache, jwt
from app.api.utils.access_decorators import ADMIN
from app.api.utils.resources_mixins import UserMixin
from app.api.utils.access_decorators import requires_role_view_all, requires_role_admin
from app.api.constants import DOWNLOAD_TOKEN, TIMEOUT_5_MINUTES
from app.api.application.models.payment_document import PaymentDocument
from app.api.documents.response_models import DOWNLOAD_TOKEN_MODEL


class ApplicationPaymentDocumentResource(Resource, UserMixin):
    @api.doc(description='Generate a token to retrieve a file object storage')
    @api.marshal_with(DOWNLOAD_TOKEN_MODEL, code=200)
    @requires_role_admin
    def get(self, application_guid, document_guid):
        payment_document = PaymentDocument.find_by_guid(application_guid, document_guid)
        if not payment_document:
            raise NotFound('Application payment document not found')

        token_guid = uuid.uuid4()
        cache.set(DOWNLOAD_TOKEN(token_guid), {'document_guid': document_guid}, TIMEOUT_5_MINUTES)
        return {'token_guid': token_guid}

    @api.doc(description='Soft delete of payment document')
    @requires_role_admin
    def delete(self, application_guid, document_guid):
        payment_document = PaymentDocument.find_by_guid(application_guid, document_guid)
        if not payment_document:
            raise NotFound('Application payment document not found')

        payment_document.soft_delete()
        return None, 204
