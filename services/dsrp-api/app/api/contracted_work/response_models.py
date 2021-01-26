from app.extensions import api
from flask_restplus import fields
from app.api.application.response_models import APPLICATION_DOCUMENT_SMALL

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

CONTRACTED_WORK_PAYMENT_STATUS_CHANGE = api.model('ContractedWorkPaymentStatusChange', {
    'contracted_work_payment_status_code': fields.String,
    'note': fields.String
})

CONTRACTED_WORK_PAYMENT = api.model(
    'ContractedWorkPayment', {
        'contracted_work_payment_id': fields.Integer,
        'application_guid': fields.String,
        'work_id': fields.String,
        'interim_payment_status_code': fields.String,
        'final_payment_status_code': fields.String,
        'interim_actual_cost': fields.Fixed(decimals=2),
        'final_actual_cost': fields.Fixed(decimals=2),
        'interim_paid_amount': fields.Fixed(decimals=2),
        'final_paid_amount': fields.Fixed(decimals=2),
        'interim_total_hours_worked_to_date': fields.Fixed(decimals=2),
        'final_total_hours_worked_to_date': fields.Fixed(decimals=2),
        'interim_number_of_workers': fields.Integer,
        'final_number_of_workers': fields.Integer,
        'interim_report': fields.String,
        'work_completion_date': fields.Date,
        'interim_submitter_name': fields.String,
        'final_submitter_name': fields.String,
        'interim_payment_submission_date': fields.DateTime,
        'final_payment_submission_date': fields.DateTime,
        'has_interim_prfs': fields.Boolean,
        'has_final_prfs': fields.Boolean,
        'review_deadlines': fields.Nested({
            'interim': fields.DateTime,
            'final': fields.DateTime
        }),
        'interim_eoc_document': fields.Nested(APPLICATION_DOCUMENT_SMALL, skip_none=True),
        'final_eoc_document': fields.Nested(APPLICATION_DOCUMENT_SMALL, skip_none=True),
        'final_report_document': fields.Nested(APPLICATION_DOCUMENT_SMALL, skip_none=True),
        'interim_payment_status': fields.Nested(
            CONTRACTED_WORK_PAYMENT_STATUS_CHANGE, skip_none=True),
        'final_payment_status': fields.Nested(
            CONTRACTED_WORK_PAYMENT_STATUS_CHANGE, skip_none=True),
        'audit_ind': fields.Boolean,
        'surface_landowner': fields.String,
        'reclamation_was_achieved': fields.Boolean,
        'abandonment_downhole_completed': fields.Boolean,
        'abandonment_cut_and_capped_completed': fields.Boolean,
        'abandonment_equipment_decommissioning_completed': fields.Boolean,
        'abandonment_notice_of_operations_submitted': fields.Boolean,
        'abandonment_was_pipeline_abandoned': fields.Boolean,
        'abandonment_metres_of_pipeline_abandoned': fields.Integer,
        'site_investigation_type_of_document_submitted': fields.String,
        'site_investigation_concerns_identified': fields.Boolean,
        'remediation_identified_contamination_meets_standards': fields.Boolean,
        'remediation_type_of_document_submitted': fields.String,
        'remediation_reclaimed_to_meet_cor_p1_requirements': fields.Boolean,
        'reclamation_reclaimed_to_meet_cor_p2_requirements': fields.Boolean,
        'reclamation_surface_reclamation_criteria_met': fields.Boolean
    })
