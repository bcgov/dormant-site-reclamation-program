from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION_SUMMARY
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_otp_or_admin


class ApplicationSummaryResource(Resource, UserMixin):
    @api.doc(description='Get an application summary')
    @api.marshal_with(APPLICATION_SUMMARY, code=200)
    @requires_otp_or_admin
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application
