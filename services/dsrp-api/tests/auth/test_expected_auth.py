import pytest
from app.api.utils.access_decorators import VIEW_ALL

from app.api.download_token.resources.download_token import DownloadTokenResource

@pytest.mark.parametrize("resource,method,expected_roles", [
    
    (DownloadTokenResource, "get", [VIEW_ALL, MINESPACE_PROPONENT]),
])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
