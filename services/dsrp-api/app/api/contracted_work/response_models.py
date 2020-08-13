from app.extensions import api
from flask_restplus import fields

CONTRACTED_WORK_STATUS = api.model('ContractedWorkStatus', {
    'contracted_work_status_code': fields.String,
    'description': fields.String
})

CONTRACTED_WORK_PAYMENT_STATUS = api.model(
    'ContractedWorkPaymentStatus', {
        'contracted_work_payment_status_code': fields.String,
        'description': fields.String,
        'long_description': fields.String
    })

CONTRACTED_WORK_PAYMENT = api.model(
    'ContractedWorkPayment', {
        'contracted_work_payment_id': fields.Integer,
        'application_guid': fields.String,
        'work_id': fields.String,
        'interim_payment_status_code': fields.String,
        'final_payment_status_code': fields.String,
        'interim_actual_est_cost': fields.Fixed(decimals=2),
        'final_actual_est_cost': fields.Fixed(decimals=2),
        'interim_total_hours_worked_to_date': fields.Integer,
        'final_total_hours_worked_to_date': fields.Integer,
        'interim_total_people_employed_to_date': fields.Integer,
        'final_total_people_employed_to_date': fields.Integer,
        'interim_eoc_application_document_guid': fields.String,
        'final_eoc_application_document_guid': fields.String,
    })
