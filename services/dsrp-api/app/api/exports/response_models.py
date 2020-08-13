from app.extensions import api
from flask_restplus import fields

from app.api.application.response_models import APPLICATION_STATUS, APPLICATION_DOCUMENT_TYPE, PAYMENT_DOCUMENT_TYPE
from app.api.contracted_work.response_models import CONTRACTED_WORK_STATUS, CONTRACTED_WORK_PAYMENT_STATUS

STATIC_CONTENT = api.model(
    'StaticContentModel', {
        'applicationStatusOptions':
        fields.List(fields.Nested(APPLICATION_STATUS), attribute='ApplicationStatus'),
        'applicationDocumentTypeOptions':
        fields.List(fields.Nested(APPLICATION_DOCUMENT_TYPE), attribute='ApplicationDocumentType'),
        'paymentDocumentTypeOptions':
        fields.List(fields.Nested(PAYMENT_DOCUMENT_TYPE), attribute='PaymentDocumentType'),
        'contractedWorkStatusOptions':
        fields.List(fields.Nested(CONTRACTED_WORK_STATUS), attribute='ContractedWorkStatus'),
        'contractedWorkPaymentStatusOptions':
        fields.List(
            fields.Nested(CONTRACTED_WORK_PAYMENT_STATUS), attribute='ContractedWorkPaymentStatus')
    })
