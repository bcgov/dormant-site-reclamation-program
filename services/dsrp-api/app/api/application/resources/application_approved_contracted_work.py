from flask_restplus import Resource
from werkzeug.exceptions import NotFound

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION_APPROVED_CONTRACTED_WORK
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_role_admin


class ApplicationApprovedContractedWorkResource(Resource, UserMixin):
    # TODO: Protect me with OTP
    @api.doc(
        description=
        'Get the information required for an applicant to manage the approved contracted work payment information on their application.'
    )
    @api.marshal_with(APPLICATION_APPROVED_CONTRACTED_WORK, code=200)
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application


class ApplicationApprovedContractedWorkListResource(Resource, UserMixin):
    # TODO: Implement
    @api.doc(description='Get the information required to manage the payments on an application.')
    # @api.marshal_with(None, code=200)
    @requires_role_admin
    def get(self):
        # Get all approved applications

        # Get all approved contracted work items on those applications

        # Apply filtering/sorting

        # Paginate

        # Return
        return [], 501