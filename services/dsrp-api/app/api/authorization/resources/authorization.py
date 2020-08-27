from flask_restplus import Resource
from flask import current_app, request, abort
import uuid
import sys

from app.extensions import cache, api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.services.email_service import EmailService
from app.api.constants import TIMEOUT_4_HOURS
from app.api.authorization.constants import ONE_TIME_LINK, ONE_TIME_PASSWORD, ONE_TIME_LINK_GENERATE_URL


class AuthorizationResource(Resource, UserMixin):
    @api.doc(description='authorization endpoint is reachable')
    def get(self):
        return "OK", 200

    @api.doc(
        description='generates and sends OTL to an email address associated with the application')
    def post(self, application_guid):
        application = Application.find_by_guid(application_guid)
        otl_guid = uuid.uuid4().hex

        # TODO replace text and url
        html_content = f"""
            <p>
                Clicking this button will issue a one time password to access your application information and submit 
                subsequent documentation for the DSRP program, it’s only clickable one time, and expires in 4 hours
            </p>

            <table width="100%" cellspacing="0" cellpadding="0">
            <tr>
                <td>
                    <table style="margin-left: auto; margin-right: auto;" cellspacing="0" cellpadding="0">
                        <tr>
                            <td style="border-radius: 2px;" bgcolor="#003366">
                                <a href="{ONE_TIME_LINK_GENERATE_URL}" target="_blank" style="padding: 8px 12px; border: 1px solid #003366;border-radius: 2px;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                                    Click             
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>"""

        with EmailService() as es:
            es.send_email_to_applicant(
                application, 'One time link password for application: {application_guid}',
                html_content)

        cache.set(ONE_TIME_LINK(otl_guid), application.guid, timeout=TIMEOUT_4_HOURS)

        return "OK", 200

    @api.doc(description='generates and returns OTP')
    def put(self, otl_guid):
        if cache.get(ONE_TIME_LINK(otl_guid)):
            app_id = cache.get(ONE_TIME_LINK(otl_guid))
            cache.delete(ONE_TIME_LINK(otl_guid))
            cache.set(ONE_TIME_PASSWORD(uuid.uuid4().hex), app_id, timeout=TIMEOUT_4_HOURS)
        else:
            abort(401)
        # {
        # OTP: guid,
        # timeout: 4 - hors
        # }
        return "OK", 200
