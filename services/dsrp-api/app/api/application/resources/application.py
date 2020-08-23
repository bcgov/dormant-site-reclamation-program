from flask_restplus import Resource
from flask import request
from sqlalchemy_filters import apply_pagination, apply_sort
from sqlalchemy import desc, asc, func, or_, and_
from werkzeug.exceptions import BadRequest, NotFound
from marshmallow.exceptions import MarshmallowError
from flask import current_app
from sqlalchemy.orm.attributes import flag_modified
from deepdiff import DeepDiff

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all, requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.application.response_models import APPLICATION, APPLICATION_LIST
from app.api.application.models.application import Application
from app.api.application.models.application_status_change import ApplicationStatusChange
from app.api.constants import DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, DISABLE_APP_SUBMIT_SETTING
from app.api.dsrp_settings.models.dsrp_settings import DSRPSettings


class ApplicationListResource(Resource, UserMixin):
    @api.doc(description='Get all applications. Default order: submission_date asc')
    @api.marshal_with(APPLICATION_LIST, code=200)
    @requires_role_view_all
    def get(self):
        records, pagination_details = self._apply_filters_and_pagination(
            page_number=request.args.get('page', DEFAULT_PAGE_NUMBER, type=int),
            page_size=request.args.get('per_page', DEFAULT_PAGE_SIZE, type=int),
            sort_field=request.args.get('sort_field', 'submission_date', type=str),
            sort_dir=request.args.get('sort_dir', 'asc', type=str),
            application_status_code=request.args.getlist('application_status_code', type=str),
            id=request.args.get('id', type=int),
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
                                      page_number=DEFAULT_PAGE_NUMBER,
                                      page_size=DEFAULT_PAGE_SIZE,
                                      sort_field=None,
                                      sort_dir=None,
                                      id=None,
                                      guid=None,
                                      company_name=None,
                                      application_status_code=[]):

        base_query = Application.query

        filters = []

        if id:
            filters.append(Application.id == id)

        if guid:
            filters.append(Application.guid == guid)

        if application_status_code:
            base_query = base_query.filter(
                Application.application_status_code.in_(application_status_code))

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
    @api.expect(APPLICATION, validate=True)
    @api.marshal_with(APPLICATION, code=201)
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

        application.send_confirmation_email()

        return application, 201


class ApplicationResource(Resource, UserMixin):
    @api.doc(description='Get an application')
    @api.marshal_with(APPLICATION, code=200)
    @requires_role_view_all
    def get(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        return application

    @api.doc(description='Update an application')
    @requires_role_admin
    @api.expect(Application)
    @api.marshal_with(APPLICATION, code=200)
    def put(self, application_guid):
        # save history
        temp_application = Application.find_by_guid(application_guid)
        history = temp_application.save_application_history()

        application = None
        is_json_updated = None
        is_application_updated = None
        try:
            # map only specific fields
            application = Application.find_by_guid(application_guid)

            is_note_updated = application.edit_note != request.json.get("edit_note")

            if is_note_updated:
                application.edit_note = request.json.get("edit_note")

            json = request.json.get("json")

            is_json_updated = DeepDiff(json, application.json, ignore_order=True) != {}

            if is_json_updated:
                application.json["company_contact"] = json["company_contact"]
                application.process_well_sites_work_items(
                    json["well_sites"], application.iterate_application_work_items_action)

            is_application_updated = is_note_updated or is_json_updated

        except MarshmallowError as e:
            history.delete()
            raise BadRequest(e)

        try:
            if is_application_updated:
                if is_json_updated:
                    flag_modified(application, "json")

                application.save()
            else:
                history.delete()
        except:
            history.delete()
            raise

        return application


class ApplicationReviewResource(Resource, UserMixin):
    @api.doc(description='Update the review data of an application')
    @requires_role_admin
    @api.marshal_with(APPLICATION, code=200)
    def put(self, application_guid):
        application = Application.find_by_guid(application_guid)
        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        try:
            review_json = request.json['review_json']
        except Exception as e:
            raise BadRequest(e)

        application.review_json = review_json
        application.save()

        return application
