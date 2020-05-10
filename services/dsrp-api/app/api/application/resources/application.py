from flask_restplus import Resource
from flask import request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.application.response_models import APPLICATION
from app.api.application.models.application import Application
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin


class ApplicationListResource(Resource, UserMixin):
    @api.doc(description='Get all applications')
    @requires_role_view_all
    @api.marshal_with(APPLICATION, envelope='records', code=200)
    def get(self):

        applications = Application.find_all()
        return applications

    @api.doc(description='Create an application')
    @requires_role_view_all
    @api.expect(APPLICATION)
    @api.marshal_with(APPLICATION, code=201)
    def post(self):

        try:
            application = Application._schema().load(request.json['application'])
        except MarshmallowError as e:
            raise BadRequest(e)

        application.save()

        return application, 201


class ApplicationResource(Resource, UserMixin):
    @api.doc(description='Get an application')
    @requires_role_view_all
    @api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid):

        application = Application.find_by_application_guid(application_guid)

        if application is None:
            raise NotFound('No application was found with the guid provided.')

        return application

    @api.doc(description='Update an application')
    @requires_role_view_all
    @api.expect(Application)
    @api.marshal_with(APPLICATION, code=200)
    def put(self, application_guid):
        try:
            application = Application._schema().load(request.json, instance=Application.find_by_application_guid(application_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        application.save()

        return application