import pytest
from app.utils.access_decorators import VIEW_ALL
from app.docman.resources.document import DocumentResource, DocumentListResource


@pytest.mark.parametrize(
    "resource,method,expected_roles",
    [(DocumentListResource, "get", []),
     (DocumentListResource, "post",
      [VIEW_ALL]),
     (DocumentResource, "patch",
      [VIEW_ALL]),
     (DocumentResource, "head",
      [VIEW_ALL])])
def test_endpoint_auth(resource, method, expected_roles):
    endpoint = getattr(resource, method, None)
    assert endpoint != None, '{0} does not have a {1} method.'.format(resource, method.upper())

    assigned_roles = getattr(endpoint, "required_roles", [])
    assert set(expected_roles) == set(
        assigned_roles
    ), "For the {0} {1} method, expected the authorization flags {2}, but had {3} instead.".format(
        resource.__name__, method.upper(), expected_roles, assigned_roles)
