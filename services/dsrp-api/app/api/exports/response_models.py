from app.extensions import api
from flask_restplus import fields

from app.api.application.response_models import APPLICATION_STATUS

STATIC_CONTENT = api.model(
    'StaticContentModel', {
        'applicationStatusOptions':
        fields.List(fields.Nested(APPLICATION_STATUS), attribute='ApplicationStatus')
    })
