from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.services.email_service import EmailService
from app.api.utils.access_decorators import requires_role_view_all
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION, APPLICATION_LIST
from app.api.application.models.application import Application
from app.api.constants import PAGE_DEFAULT, PER_PAGE_DEFAULT


class ApplicationListResource(Resource, UserMixin):
    @api.doc(
        description='Get all applications. Default order: submission_date desc',
        params={
            'page':
            f'The page number of paginated records to return. Default: {PAGE_DEFAULT}',
            'per_page':
            f'The number of records to return per page. Default: {PER_PAGE_DEFAULT}',
        })
    #@requires_role_view_all
    @api.marshal_with(APPLICATION_LIST, code=200)
    def get(self):

        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field',
                                        'submission_date',
                                        type=str),
            sort_dir=request.args.get('sort_dir', 'desc', type=str),
            application_status_code=request.args.getlist(
                'application_status_code', type=str))

        data = records.all()

        return {
            'records': data,
            'current_page': pagination_details.page_number,
            'total_pages': pagination_details.num_pages,
            'items_per_page': pagination_details.page_size,
            'total': pagination_details.total_results
        }

    def _apply_filters_and_pagination(self,
                                      page_number=PAGE_DEFAULT,
                                      page_size=PER_PAGE_DEFAULT,
                                      sort_field=None,
                                      sort_dir=None,
                                      application_status_code=[]):

        base_query = Application.query

        filters = []

        if application_status_code:
            filters.append(
                Application.application_status_code.in_(
                    application_status_code))

        base_query = base_query.filter(*filters)

        if sort_field and sort_dir:
            sort_criteria = [{
                'model': 'Application',
                'field': sort_field,
                'direction': sort_dir,
            }]
            base_query = apply_sort(base_query, sort_criteria)

        return apply_pagination(base_query, page_number, page_size)

    @api.doc(description='Create an application')
    #@requires_role_view_all
    @api.expect(APPLICATION)
    @api.marshal_with(APPLICATION, code=201)
    def post(self):
        try:
            application = Application._schema().load(
                request.json['application'])
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
            application = Application._schema().load(
                request.json,
                instance=Application.find_by_application_guid(
                    application_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        application.save()

        return application