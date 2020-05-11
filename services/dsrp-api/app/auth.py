from cached_property import cached_property
from flask import g
from uuid import UUID
from typing import Optional, Set
from .api.utils.include.user_info import User

# This is for use when the database models are being used outside of the context of a flask application.
# Eg. Unit tests, create data.
global apply_security
apply_security = True


class UserSecurity(object):
    def __init__(self, user_id: Optional[int] = None, access: Optional[Set[UUID]] = None):
        self.access = access or {}
        self.user_id = user_id


def get_user_email():
    return User().get_user_email()


# For unit tests only
def clear_cache():
    g.current_user_security = None
    g.current_user = None
