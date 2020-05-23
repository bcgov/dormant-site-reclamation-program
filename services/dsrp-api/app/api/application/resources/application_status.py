import uuid
import requests

from flask import request, current_app, Response
from flask_restplus import Resource, reqparse, fields

from werkzeug.exceptions import BadRequest, NotFound

from app.extensions import api, db, cache, jwt
from app.api.utils.access_decorators import ADMIN
from app.api.utils.resources_mixins import UserMixin

from app.api.application.models.application import Application
from app.api.application.models.application_status_change import ApplicationStatusChange

from app.api.services.email_service import EmailService



class ApplicationStatusListResource(Resource, UserMixin):
    @api.doc(description='Register files that have been uploaded to the document store')
    def post(self, application_guid):

        application = Application.find_by_guid(application_guid)
        if not application:
            raise NotFound("Not found")

        if jwt.validate_roles(ADMIN) or application.application_status_code == "WAITING FOR DOCUMENTS": # placeholder
            pass
        
        app_status_change =  ApplicationStatusChange(
            application_status_code=request.json['application_status_code'], 
            note=request.json['note']
        )

        application.status_changes.append(app_status_change)
        application.save()
        db.session.refresh(app_status_change)

        with EmailService() as es:
            app_status_change.send_status_change_email(es)

        return '', 204

