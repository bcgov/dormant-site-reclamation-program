from app.extensions import api
from flask_restplus import fields

from app.api.application.response_models import APPLICATION_STATUS
from app.api.contracted_work.response_models import CONTRACTED_WORK_STATUS

STATIC_CONTENT = api.model(
    'StaticContentModel', {
        'applicationStatusOptions':
        fields.List(fields.Nested(APPLICATION_STATUS), attribute='ApplicationStatus'),
        'contractedWorkStatusOptions':
        fields.List(fields.Nested(CONTRACTED_WORK_STATUS), attribute='ContractedWorkStatus')
    })