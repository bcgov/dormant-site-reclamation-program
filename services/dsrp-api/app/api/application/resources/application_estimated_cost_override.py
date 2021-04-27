from flask_restplus import Resource
from werkzeug.exceptions import NotFound
from flask import request

from sqlalchemy.orm.attributes import flag_modified
from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_role_admin


def validate_application_contracted_work(application, work_id):
    if application is None:
        raise NotFound('No application was found matching the provided reference number')

    contracted_work = application.find_contracted_work_by_id(work_id)
    if contracted_work is None:
        raise NotFound(
            'No contracted work matching the provided work ID was found on that application')


class ApplicationEstimatedCostOverride(Resource, UserMixin):
    @api.doc(description='Update the estimated cost override of a work item on an application')
    @requires_role_admin
    def put(self, application_guid, work_id):

        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Update the estimated cost override for this work item.
        estimated_cost_overrides = application.estimated_cost_overrides or {}
        estimated_cost_override = request.json.get('est_cost_override')
        estimated_cost_overrides[work_id] = estimated_cost_override

        if all(v is None for v in estimated_cost_overrides.values()):
            estimated_cost_overrides = None

        application.estimated_cost_overrides = estimated_cost_overrides
        flag_modified(application, "estimated_cost_overrides")
        application.save()
        return '', 200
