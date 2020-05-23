from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION_SUMMARY
from app.api.application.models.application import Application


class ApplicationSummaryResource(Resource, UserMixin):
    @api.doc(description='Get an application summary')
    @api.marshal_with(APPLICATION_SUMMARY, code=200)
    def get(self, application_guid):

        application = Application.find_by_guid(application_guid)

        if application is None:
            raise NotFound('No application was found with the guid provided.')

        return application
