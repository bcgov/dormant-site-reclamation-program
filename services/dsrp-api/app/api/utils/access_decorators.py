from functools import wraps
from flask_jwt_oidc.exceptions import AuthError
from werkzeug.exceptions import Forbidden
from flask import current_app, request, abort, redirect

from app.extensions import jwt
from app.extensions import cache
from app.api.authorization.constants import *

VIEW_ALL = "view_all"
ADMIN = "admin"

SECRET_KEY = "1"
SECRET_PASSWORD = "1"


def requires_role_view_all(func):
    return _inner_wrapper(func, VIEW_ALL)


def requires_role_admin(func):
    return _inner_wrapper(func, ADMIN)


def requires_any_of(roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwds):
            try:
                return jwt.has_one_of_roles(roles)(func)(*args, **kwds)
            except AuthError as e:
                raise Forbidden(e.error['description'])

        wrapper.required_roles = _combine_role_flags(func, roles)
        return wrapper

    return decorator


def _inner_wrapper(func, role):
    @wraps(func)
    def wrapper(*args, **kwds):
        return jwt.requires_roles([role])(func)(*args, **kwds)

    wrapper.required_roles = _combine_role_flags(func, [role])
    return wrapper


def _combine_role_flags(func, roles):
    flags = getattr(func, "required_roles", [])
    flags.extend(roles)
    return flags


def requires_otp(func):
    @wraps(func)
    def check_api_key(*args, **kwargs):
        # enforce admin permission
        try:
            return jwt.has_one_of_roles([ADMIN])(func)(*args, **kwargs)
        except Exception as e:
            current_app.logger.error(str(e))
            pass

        # TODO this checks for debug purpose, will be reworked in final pr
        otl_guid = request.headers.get(ONE_TIME_LINK)
        otp_guid = request.headers.get(ONE_TIME_PASSWORD)
        if not otl_guid and not otp_guid:
            current_app.logger.info("OTL and OTP is empty")
            abort(401)
        elif otl_guid and otl_guid == cache.get(otl_guid):
            current_app.logger.info("OTL IS PRESENT NEED TO GENERATE OTP")
            abort(401)
        elif not otl_guid and otp_guid:
            current_app.logger.info("OTL is not present but OTP is")
            otp_app_guid = cache.get(otp_guid)
            header_app_guid = request.headers.get("app_guid")
            if otp_app_guid and otp_app_guid == header_app_guid:
                current_app.logger.info("OTP is correct")
                return func(*args, **kwargs)
            else:
                current_app.logger.info("OTP is linked to a different application")
                abort(401)
        else:
            current_app.logger.info("OTP is expired")
            abort(401)

    return check_api_key