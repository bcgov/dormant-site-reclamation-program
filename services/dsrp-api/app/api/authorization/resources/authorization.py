from flask_restplus import Resource
from flask import current_app, request, abort, jsonify
import uuid
import sys
from datetime import datetime, timezone
from werkzeug.exceptions import NotFound

from app.extensions import cache, api
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.services.email_service import EmailService
from app.api.constants import TIMEOUT_4_HOURS
from app.api.authorization.constants import *
from app.api.utils.custom_reqparser import CustomReqparser
from app.config import Config


class AuthorizationResource(Resource, UserMixin):
    parser = CustomReqparser()
    parser.add_argument('application_guid', type=str, help='', store_missing=False)
    parser.add_argument('otl_guid', type=str, help='', store_missing=False)

    ONE_TIME_PASSWORD_TIMEOUT_SECONDS = Config.ONE_TIME_PASSWORD_TIMEOUT_SECONDS

    @api.doc(description='authorization endpoint is reachable')
    def get(self):
        return "OK", 200

    @api.doc(
        description='generates and sends OTL to an email address associated with the application')
    def post(self):
        data = AuthorizationResource.parser.parse_args()
        application_guid = data.get('application_guid')
        application = Application.find_by_guid(application_guid)
        otl_guid = uuid.uuid4()

        if application is None:
            raise NotFound('No application was found matching the provided reference number')

        html_content = f"""
        <table width="100%" style="font-size:12.0pt; color:#595959 " >
            <tr>
                <td>
                    You have requested access to the Dormant Sites Reclamation Program site to view information about an application (see Reference Number above).
                    <br/>
                    <br/>
                    Use the button below to access your application information and submit payment requests.
                    <br/>
                    This button can only be used once and access expires after four hours. If you need to access the application again, request another link on the website.
                </td> 
            </tr>   
            <tr>
                <td>
                <br/>
                    <table style="margin-left: auto; margin-right: auto;">
                        <tr>
                            <td style="border-radius: 2px;" bgcolor="#003366" >
                                <a href="{ONE_TIME_LINK_FRONTEND_URL(otl_guid)}" target="_blank" style="padding: 8px 12px; border: 1px solid #003366;border-radius: 2px;font-size: 14px; color: #ffffff;text-decoration: none;font-weight:bold;display: inline-block;">
                                    View Application             
                                </a>
                            </td>
                        </tr>
                    </table>
                <br/>
                </td>
            </tr>
		</table>"""

        with EmailService() as es:
            es.send_email_to_applicant(application,
                                       f"Dormant Site Reclamation Program – Access Request",
                                       html_content)

        current_app.logger.debug(f"This is a OTL: {otl_guid}")
        cache.set(
            str(otl_guid),
            application_guid,
            timeout=AuthorizationResource.ONE_TIME_PASSWORD_TIMEOUT_SECONDS)

        return "OK", 200

    @api.doc(description='generates and returns OTP')
    def put(self):
        otp_guid = None
        issued_time_utc = None
        timeout = AuthorizationResource.ONE_TIME_PASSWORD_TIMEOUT_SECONDS

        data = AuthorizationResource.parser.parse_args()
        otl_guid = data.get('otl_guid')
        app_guid = cache.get(otl_guid)

        current_app.logger.info(f'this is app_guid: {app_guid}')

        if otl_guid and app_guid:
            cache.delete(otl_guid)
            current_app.logger.info(f"OTL_GUID_VALUE: {cache.get(otl_guid)}")
            otp_guid = uuid.uuid4()
            issued_time_utc = datetime.now(timezone.utc)
            cache.set(str(otp_guid), app_guid, timeout=timeout)
        else:
            abort(401)

        return jsonify({
            "OTP": otp_guid,
            "issued_time_utc": issued_time_utc.strftime("%d %b %Y %H:%M:%S %z"),
            "timeout_seconds": AuthorizationResource.ONE_TIME_PASSWORD_TIMEOUT_SECONDS,
            "application_guid": app_guid
        })
