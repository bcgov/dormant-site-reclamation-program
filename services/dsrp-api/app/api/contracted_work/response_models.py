from app.extensions import api
from flask_restplus import fields

CONTRACTED_WORK_STATUS = api.model('ContractedWorkStatus', {
    'contracted_work_status_code': fields.String,
    'description': fields.String
})
