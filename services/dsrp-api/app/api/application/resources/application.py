import json
from flask_restplus import Resource
from flask import request
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError
from app.extensions import api
from app.api.services.email_service import EmailService
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin


from app.api.application.response_models import APPLICATION, APPLICATION_LIST
from app.api.application.models.application import Application

class ApplicationListResource(Resource, UserMixin):
    @api.doc(description='Get all applications')
    #@requires_role_view_all
    @api.marshal_with(APPLICATION_LIST, code=200)
    def get(self):
        data = Application.get_all()

        return {
            'records': data,
        }


    @api.doc(description='Create an application')
    #@requires_role_view_all
    @api.expect(APPLICATION)
    @api.marshal_with(APPLICATION, code=201)
    def post(self):
        try:
            application = Application._schema().load(request.json['application'])
            application.save()
        except MarshmallowError as e:
            raise BadRequest(e)
        
        with EmailService() as es:
            application.send_confirmation_email(es)

        return application, 201


class ApplicationResource(Resource, UserMixin):
    @api.doc(description='Get an application')
    ##@requires_role_view_all
    @api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid):

        application = Application.find_by_application_guid(application_guid)

        if application is None:
            raise NotFound('No application was found with the guid provided.')

        return application

    @api.doc(description='Update an application')
    #@requires_role_view_all
    @api.expect(Application)
    @api.marshal_with(APPLICATION, code=200)
    def put(self, application_guid):
        try:
            application = Application._schema().load(request.json, instance=Application.find_by_application_guid(application_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        application.save()

        return application