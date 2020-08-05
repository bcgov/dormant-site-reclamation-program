from flask import request
from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api, db
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.application.models.application_status_change import ApplicationStatusChange
from app.api.utils.access_decorators import requires_role_admin


class ApplicationStatusListResource(Resource, UserMixin):
    @api.doc(description='Change status on an application and send an email')
    @requires_role_admin
    def post(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if not application:
            raise NotFound('No application was found matching the provided reference number')

        app_status_change = ApplicationStatusChange(
            application=application,
            application_status_code=request.json['application_status_code'],
            note=request.json['note'])
        app_status_change.save()

        return '', 204
