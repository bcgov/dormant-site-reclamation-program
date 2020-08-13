from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION_APPROVED_CONTRACTED_WORK
from app.api.application.models.application import Application


class ApplicationApprovedContractedWorkResource(Resource, UserMixin):
    @api.doc(description='Get the information required to manage the payments on an application.')
    @api.marshal_with(APPLICATION_APPROVED_CONTRACTED_WORK, code=200)
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application
