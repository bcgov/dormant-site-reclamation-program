from functools import wraps
from app.extensions import jwt
from flask_jwt_oidc.exceptions import AuthError
from werkzeug.exceptions import Forbidden

VIEW_ALL = "view_all"
ADMIN = "admin"

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
