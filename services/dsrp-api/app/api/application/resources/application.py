from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, func, or_, and_
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError

from app.extensions import api
from app.api.services.email_service import EmailService
from app.api.utils.access_decorators import requires_role_view_all, requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION, APPLICATION_LIST
from app.api.application.models.application import Application
from app.api.constants import PAGE_DEFAULT, PER_PAGE_DEFAULT, DISABLE_APP_SUBMIT_SETTING
from app.api.dsrp_settings.models.dsrp_settings import DSRPSettings


class ApplicationListResource(Resource, UserMixin):
    @api.doc(description='Get all applications. Default order: submission_date asc')
    @api.marshal_with(APPLICATION_LIST, code=200)
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', PAGE_DEFAULT, type=int),
            page_size=request.args.get('per_page', PER_PAGE_DEFAULT, type=int),
            sort_field=request.args.get('sort_field', 'submission_date', type=str),
            sort_dir=request.args.get('sort_dir', 'asc', type=str),
            application_status_code=request.args.getlist('application_status_code', type=str),
            guid=request.args.get('guid', type=str),
            company_name=request.args.get('company_name', type=str))

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
                                      guid=None,
                                      company_name=None,
                                      application_status_code=[]):

        base_query = Application.query

        filters = []

        if guid:
            filters.append(Application.guid == guid)

        if application_status_code:
            filters.append(Application.application_status_code.in_(application_status_code))

        if company_name:
            filters.append(
                Application.json['company_details']['company_name']['label'].astext.contains(
                    company_name.upper()))

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
    @api.expect(APPLICATION)
    # @api.marshal_with(APPLICATION, code=201)
    def post(self):
        applications_disabled = DSRPSettings.find_by_setting(
            DISABLE_APP_SUBMIT_SETTING).setting_value
        if applications_disabled:
            raise BadRequest("Application Submissions are disabled at this time.")

        try:
            application = Application._schema().load(request.json['application'])
            #get ip from NGINX (or direct for local devs)
            application.submitter_ip = request.headers.getlist(
                'X-Forwarded-For')[0] if request.headers.getlist(
                    'X-Forwarded-For') else request.remote_addr
            application.save()
        except MarshmallowError as e:
            raise BadRequest(e)

        with EmailService() as es:
            application.send_confirmation_email(es)

        table_html = application.get_application_email_display()

        return table_html, 201


class ApplicationResource(Resource, UserMixin):
    @api.doc(description='Get an application')
    @api.marshal_with(APPLICATION, code=200)
    def get(self, application_guid):

        application = Application.find_by_guid(application_guid)

        if application is None:
            raise NotFound('No application was found with the guid provided.')

        return application

    @api.doc(description='Update an application')
    @requires_role_admin
    @api.expect(Application)
    @api.marshal_with(APPLICATION, code=200)
    def put(self, application_guid):
        try:
            application = Application._schema().load(
                request.json, instance=Application.find_by_guid(application_guid))
        except MarshmallowError as e:
            raise BadRequest(e)

        application.save()

        return application


class ApplicationReviewResource(Resource, UserMixin):
    @api.doc(description='Update the review data of an application')
    @requires_role_admin
    @api.marshal_with(APPLICATION, code=200)
    def put(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found with the guid provided.')

        try:
            review_json = request.json['review_json']
        except Exception as e:
            raise BadRequest(e)

        application.review_json = review_json
        application.save()

        return application
