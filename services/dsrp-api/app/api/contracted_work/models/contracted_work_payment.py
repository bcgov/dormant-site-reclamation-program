from datetime import datetime, timedelta

from sqlalchemy.schema import FetchedValue
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy import desc, func, and_, select

from app.extensions import db
from app.api.utils.models_mixins import Base, AuditMixin
from app.api.contracted_work.models.contracted_work_payment_status_change import ContractedWorkPaymentStatusChange
from app.api.constants import REVIEW_DEADLINE_NOT_APPLICABLE, REVIEW_DEADLINE_PAID


class ContractedWorkPayment(Base, AuditMixin):
    __tablename__ = 'contracted_work_payment'

    def __init__(self, application, contracted_work_payment_status_code,
                 contracted_work_payment_code, **kwargs):
        super(ContractedWorkPayment, self).__init__(**kwargs)
        initial_status = ContractedWorkPaymentStatusChange(
            contracted_work_payment=self,
            application=application,
            contracted_work_payment_status_code=contracted_work_payment_status_code,
            contracted_work_payment_code=contracted_work_payment_code)
        self.status_changes.append(initial_status)

    contracted_work_payment_id = db.Column(db.Integer, primary_key=True)
    application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('application.guid'), nullable=False)
    work_id = db.Column(db.String, unique=True, nullable=False)

    interim_actual_cost = db.Column(db.Numeric(14, 2))
    final_actual_cost = db.Column(db.Numeric(14, 2))

    interim_paid_amount = db.Column(db.Numeric(14, 2))
    final_paid_amount = db.Column(db.Numeric(14, 2))

    interim_total_hours_worked_to_date = db.Column(db.Numeric(14, 2))
    final_total_hours_worked_to_date = db.Column(db.Numeric(14, 2))

    interim_number_of_workers = db.Column(db.Integer)
    final_number_of_workers = db.Column(db.Integer)

    work_completion_date = db.Column(db.Date)

    interim_submitter_name = db.Column(db.String)
    final_submitter_name = db.Column(db.String)

    interim_eoc_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)
    final_eoc_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)

    final_report_application_document_guid = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('application_document.application_document_guid'),
        unique=True)

    interim_eoc_document = db.relationship(
        'ApplicationDocument',
        lazy='selectin',
        foreign_keys=[interim_eoc_application_document_guid])
    final_eoc_document = db.relationship(
        'ApplicationDocument', lazy='selectin', foreign_keys=[final_eoc_application_document_guid])

    interim_report = db.Column(db.String)
    final_report_document = db.relationship(
        'ApplicationDocument',
        lazy='selectin',
        foreign_keys=[final_report_application_document_guid])

    subcontractors = db.Column(JSONB)

    status_changes = db.relationship(
        'ContractedWorkPaymentStatusChange',
        lazy='selectin',
        order_by='desc(ContractedWorkPaymentStatusChange.change_timestamp)')

    payment_documents = db.relationship(
        'PaymentDocument',
        lazy='selectin',
        secondary='payment_document_contracted_work_payment_xref')

    # Auditing
    audit_ind = db.Column(db.Boolean)
    audit_user = db.Column(db.String)
    audit_timestamp = db.Column(db.DateTime)

    # General Reporting
    surface_landowner = db.Column(db.String)
    reclamation_was_achieved = db.Column(db.Boolean)

    # Abandonment Reporting
    abandonment_downhole_completed = db.Column(db.Boolean)
    abandonment_cut_and_capped_completed = db.Column(db.Boolean)
    abandonment_equipment_decommissioning_completed = db.Column(db.Boolean)
    abandonment_notice_of_operations_submitted = db.Column(db.Boolean)
    abandonment_was_pipeline_abandoned = db.Column(db.Boolean)
    abandonment_metres_of_pipeline_abandoned = db.Column(db.Integer)

    # PSI and DSI Reporting
    site_investigation_type_of_document_submitted = db.Column(db.String)
    site_investigation_concerns_identified = db.Column(db.Boolean)

    # Remediation Reporting
    remediation_identified_contamination_meets_standards = db.Column(db.Boolean)
    remediation_type_of_document_submitted = db.Column(db.String)
    remediation_reclaimed_to_meet_cor_p1_requirements = db.Column(db.Boolean)

    # Reclamation Reporting
    reclamation_reclaimed_to_meet_cor_p2_requirements = db.Column(db.Boolean)
    reclamation_surface_reclamation_criteria_met = db.Column(db.Boolean)

    @hybrid_property
    def has_interim_prfs(self):
        if self.payment_documents:
            return any(doc.active_ind and doc.payment_document_code == 'INTERIM_PRF'
                       for doc in self.payment_documents)
        return False

    @hybrid_property
    def has_final_prfs(self):
        if self.payment_documents:
            return any(doc.active_ind and doc.payment_document_code == 'FINAL_PRF'
                       for doc in self.payment_documents)
        return False

    @hybrid_property
    def interim_payment_status_code(self):
        if self.interim_payment_status:
            return self.interim_payment_status.contracted_work_payment_status_code
        else:
            return 'INFORMATION_REQUIRED'

    @hybrid_property
    def interim_payment_status(self):
        if self.interim_payment_status_changes:
            return self.interim_payment_status_changes[0]

    @hybrid_property
    def interim_payment_status_changes(self):
        return [
            status for status in self.status_changes
            if status.contracted_work_payment_code == 'INTERIM'
        ]

    @hybrid_property
    def interim_payment_submission_date(self):
        if self.interim_payment_status_changes:
            return self.interim_payment_status_changes[-1].change_timestamp

    @hybrid_property
    def final_payment_status_code(self):
        if self.final_payment_status:
            return self.final_payment_status.contracted_work_payment_status_code
        else:
            return 'INFORMATION_REQUIRED'

    @hybrid_property
    def final_payment_status(self):
        if self.final_payment_status_changes:
            return self.final_payment_status_changes[0]

    @hybrid_property
    def final_payment_status_changes(self):
        return [
            status for status in self.status_changes
            if status.contracted_work_payment_code == 'FINAL'
        ]

    @hybrid_property
    def final_payment_submission_date(self):
        if self.final_payment_status_changes:
            return self.final_payment_status_changes[-1].change_timestamp

    @hybrid_property
    def review_deadlines(self):
        review_deadlines = {
            'interim': REVIEW_DEADLINE_NOT_APPLICABLE,
            'final': REVIEW_DEADLINE_NOT_APPLICABLE
        }

        interim_payment_submission_date = self.interim_payment_submission_date
        final_payment_submission_date = self.final_payment_submission_date

        # No payment information has been submitted
        if interim_payment_submission_date is None and final_payment_submission_date is None:
            return review_deadlines

        # We don't need to review payments that have already had at least one PRF issued
        if interim_payment_submission_date and self.has_interim_prfs:
            interim_payment_submission_date = None
            review_deadlines['interim'] = REVIEW_DEADLINE_PAID
        if final_payment_submission_date and self.has_final_prfs:
            final_payment_submission_date = None
            review_deadlines['final'] = REVIEW_DEADLINE_PAID

        # Both interim and final have been submitted and have completed the payment process
        if interim_payment_submission_date is None and final_payment_submission_date is None:
            return review_deadlines

        days_to_review = timedelta(days=90)

        if interim_payment_submission_date:
            interim_deadline = interim_payment_submission_date + days_to_review
            review_deadlines['interim'] = interim_deadline

        if final_payment_submission_date:
            final_deadline = final_payment_submission_date + days_to_review
            review_deadlines['final'] = final_deadline

        return review_deadlines

    def __repr__(self):
        return f'<{self.__class__.__name__} {self.contracted_work_payment_id} {self.application_guid} {self.work_id}>'

    @classmethod
    def find_by_application_guid(cls, application_guid):
        return cls.query.filter_by(application_guid=application_guid).all()

    @classmethod
    def find_by_work_id(cls, work_id):
        return cls.query.filter_by(work_id=work_id).one_or_none()
