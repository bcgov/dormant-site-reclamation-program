import decimal
import uuid
import base64
import requests
import json

from datetime import datetime
from flask import request, current_app, Response
from flask_restplus import Resource, reqparse

from werkzeug.exceptions import BadRequest, NotFound
from sqlalchemy.exc import DBAPIError

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin

from app.api.application.models.application import Application
from app.api.application.models.application_document import ApplicationDocument

from app.api.services.document_manager_service import DocumentManagerService


class ApplicationDocumentListResource(Resource, UserMixin):
    @api.doc(description='Request a document_manager_guid for uploading a document')
    def post(self):

        return DocumentManagerService.initializeFileUploadWithDocumentManager(request)
