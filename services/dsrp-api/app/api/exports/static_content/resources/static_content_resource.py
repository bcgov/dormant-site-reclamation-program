import json

from flask import Response, current_app, make_response
from flask_restplus import Resource, marshal
from sqlalchemy.inspection import inspect
from werkzeug.exceptions import InternalServerError

from app.extensions import api, cache
from app.api.utils.access_decorators import requires_role_view_all
from app.api.constants import TIMEOUT_60_MINUTES, STATIC_CONTENT_KEY
from app.api.exports.response_models import STATIC_CONTENT
from app.api.application.models.application_status import ApplicationStatus
from app.api.contracted_work.models.contracted_work_status import ContractedWorkStatus
from app.api.contracted_work.models.contracted_work_payment_status import ContractedWorkPaymentStatus
from app.api.application.models.application_document_type import ApplicationDocumentType
from app.api.application.models.payment_document_type import PaymentDocumentType

MODELS_GET_ACTIVE = [
    ApplicationStatus, ContractedWorkStatus, ApplicationDocumentType, PaymentDocumentType,
    ContractedWorkPaymentStatus
]


def generate_static_content_dict():
    static_content = {}

    for model in MODELS_GET_ACTIVE:
        static_content[model.__name__] = model.get_active()

    return static_content


class StaticContentResource(Resource):
    @api.doc(
        description=
        'Returns static content in bulk instead of calling endpoints individually, keys are custom for current store'
    )
    def get(self):
        content_json = cache.get(STATIC_CONTENT_KEY)
        if not content_json:
            current_app.logger.debug('CACHE MISS - static-content')
            content = generate_static_content_dict()
            if not content:
                raise InternalServerError("Application failed to generate static content")
            content_dict = marshal(content, STATIC_CONTENT)
            content_json = json.dumps(content_dict, separators=(',', ':'))
            cache.set(STATIC_CONTENT_KEY, content_json, TIMEOUT_60_MINUTES)

        response = make_response(content_json)
        response.headers['content-type'] = 'application/json'

        return response