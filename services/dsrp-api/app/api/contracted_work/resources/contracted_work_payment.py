from datetime import datetime
from flask_restplus import Resource
from flask import current_app, request
from werkzeug.exceptions import NotFound, BadRequest, Unauthorized

from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.application.models.application_document import ApplicationDocument
from app.api.contracted_work.models.contracted_work_payment import ContractedWorkPayment
from app.api.contracted_work.models.contracted_work_payment_status import ContractedWorkPaymentStatus
from app.api.contracted_work.models.contracted_work_payment_type import ContractedWorkPaymentType
from app.api.contracted_work.models.contracted_work_payment_status_change import ContractedWorkPaymentStatusChange
from app.api.utils.access_decorators import ADMIN
from app.api.utils.access_decorators import requires_otp_or_admin


def validate_application_contracted_work(application, work_id):
    if application is None:
        raise NotFound('No application was found matching the provided reference number')

    contracted_work = application.find_contracted_work_by_id(work_id)
    if contracted_work is None:
        raise NotFound(
            'No contracted work matching the provided work ID was found on that application')

    if application.application_status_code != 'FIRST_PAY_APPROVED':
        raise BadRequest('The application this contracted work item belongs to is not approved!')

    if contracted_work.get('contracted_work_status_code', None) != 'APPROVED':
        raise BadRequest('This contracted work item is not approved!')


class ContractedWorkPaymentInterim(Resource, UserMixin):
    @requires_otp_or_admin
    def put(self, application_guid, work_id):
        response_code = 200

        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the contracted work payment or create it if it doesn't exist.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            payment = ContractedWorkPayment(
                application=application,
                application_guid=application_guid,
                work_id=work_id,
                contracted_work_payment_status_code='READY_FOR_REVIEW',
                contracted_work_payment_code='INTERIM')
            response_code = 201
        else:
            # Applicants can only update existing contracted work payments that are in the Information Required status.
            if payment.interim_payment_status_code != 'INFORMATION_REQUIRED':
                raise BadRequest(
                    'Only contracted work payments with the status Information Required can be modified'
                )
            status_change = ContractedWorkPaymentStatusChange(
                contracted_work_payment=payment,
                application=application,
                contracted_work_payment_status_code='READY_FOR_REVIEW',
                contracted_work_payment_code='INTERIM')
            payment.status_changes.append(status_change)

        # Update the required data points.
        interim_payment_data = request.json
        payment.interim_total_hours_worked_to_date = interim_payment_data[
            'interim_total_hours_worked_to_date']
        payment.interim_number_of_workers = interim_payment_data['interim_number_of_workers']
        payment.interim_actual_cost = interim_payment_data['interim_actual_cost']
        payment.interim_submitter_name = interim_payment_data['interim_submitter_name']

        # The interim report is optional at this step.
        interim_report = interim_payment_data.get('interim_report')
        if interim_report:
            payment.interim_report = interim_report

        # The EoC is only required if it hasn't been provided yet.
        interim_eoc_data = interim_payment_data.get('interim_eoc', [None])[0]
        if not interim_eoc_data and not payment.interim_eoc_document:
            raise BadRequest('Evidence of Cost is required!')

        # Create the EoC document and soft-delete the existing one (if it exists).
        if interim_eoc_data:
            if payment.interim_eoc_document:
                payment.interim_eoc_document.active_ind = False
            filename = ApplicationDocument.create_filename(application, payment.work_id,
                                                           'INTERIM_EOC', 'xlsx')
            interim_eoc = ApplicationDocument(
                document_name=filename,
                object_store_path=interim_eoc_data['key'],
                application_document_code='INTERIM_EOC')
            application.documents.append(interim_eoc)
            application.save()
            payment.interim_eoc_application_document_guid = interim_eoc.application_document_guid

        payment.save()
        return '', response_code


class ContractedWorkPaymentFinal(Resource, UserMixin):
    @requires_otp_or_admin
    def put(self, application_guid, work_id):
        response_code = 200

        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the contracted work payment or create it if it doesn't exist.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            payment = ContractedWorkPayment(
                application=application,
                application_guid=application_guid,
                work_id=work_id,
                contracted_work_payment_status_code='READY_FOR_REVIEW',
                contracted_work_payment_code='FINAL')
            response_code = 201
        else:
            # Applicants can only update existing contracted work payments that are in the Information Required status.
            if payment.final_payment_status_code != 'INFORMATION_REQUIRED':
                raise BadRequest(
                    'Only contracted work payments with the status Information Required can be modified'
                )
            status_change = ContractedWorkPaymentStatusChange(
                contracted_work_payment=payment,
                application=application,
                contracted_work_payment_status_code='READY_FOR_REVIEW',
                contracted_work_payment_code='FINAL')
            payment.status_changes.append(status_change)

        # Update the required data points.
        final_payment_data = request.json
        payment.final_total_hours_worked_to_date = final_payment_data[
            'final_total_hours_worked_to_date']
        payment.final_number_of_workers = final_payment_data['final_number_of_workers']
        payment.final_actual_cost = final_payment_data['final_actual_cost']
        payment.work_completion_date = final_payment_data['work_completion_date']
        payment.final_submitter_name = final_payment_data['final_submitter_name']

        # Update the general reporting data point "surface landowner".
        surface_landowner = final_payment_data['surface_landowner']
        if surface_landowner not in ('Crown', 'Freehold', 'Both'):
            raise BadRequest('Unknown "surface landowner" value received!')
        payment.surface_landowner = surface_landowner

        # Update the general reporting data point "reclamation was achieved".
        reclamation_was_achieved = final_payment_data['reclamation_was_achieved']
        if reclamation_was_achieved not in ('true', 'false'):
            raise BadRequest('Unknown "reclamation was achieved" value received!')
        payment.reclamation_was_achieved = bool(reclamation_was_achieved)

        # Update the work-type specific reporting data points.
        contracted_work_type = application.find_contracted_work_type_by_work_id(payment.work_id)

        def parseBool(value):
            if value not in ('true', 'false'):
                raise BadRequest(f'{value} is not a valid boolean value')
            return value == 'true'

        # Abandonment reporting
        if contracted_work_type == 'abandonment':
            payment.abandonment_cut_and_capped_completed = parseBool(
                final_payment_data['abandonment_cut_and_capped_completed'])

            payment.abandonment_notice_of_operations_submitted = parseBool(
                final_payment_data['abandonment_notice_of_operations_submitted'])

            abandonment_was_pipeline_abandoned = parseBool(
                final_payment_data['abandonment_was_pipeline_abandoned'])
            payment.abandonment_was_pipeline_abandoned = abandonment_was_pipeline_abandoned
            if abandonment_was_pipeline_abandoned:
                payment.abandonment_metres_of_pipeline_abandoned = int(
                    final_payment_data['abandonment_metres_of_pipeline_abandoned'])

        # Reclamation reporting
        elif contracted_work_type == 'reclamation':
            payment.reclamation_reclaimed_to_meet_cor_p2_requirements = parseBool(
                final_payment_data['reclamation_reclaimed_to_meet_cor_p2_requirements'])

            payment.reclamation_surface_reclamation_criteria_met = parseBool(
                final_payment_data['reclamation_surface_reclamation_criteria_met'])

        # Remediation reporting
        elif contracted_work_type == 'remediation':
            remediation_type_of_document_submitted = final_payment_data[
                'remediation_type_of_document_submitted']
            if remediation_type_of_document_submitted not in ('COR_P1', 'DSAF', 'NONE'):
                raise BadRequest('Unknown "remediation type of document submitted" value received!')
            payment.remediation_type_of_document_submitted = remediation_type_of_document_submitted

            payment.remediation_identified_contamination_meets_standards = parseBool(
                final_payment_data['remediation_identified_contamination_meets_standards'])

            payment.remediation_reclaimed_to_meet_cor_p1_requirements = parseBool(
                final_payment_data['remediation_reclaimed_to_meet_cor_p1_requirements'])

        # Site investigation reporting
        elif contracted_work_type in ('preliminary_site_investigation',
                                      'detailed_site_investigation'):
            site_investigation_type_of_document_submitted = final_payment_data[
                'site_investigation_type_of_document_submitted']
            if site_investigation_type_of_document_submitted not in ('COR_P1', 'DSAF', 'NONE'):
                raise BadRequest(
                    'Unknown "site investigation type of document submitted" value received!')
            payment.site_investigation_type_of_document_submitted = site_investigation_type_of_document_submitted

            payment.site_investigation_concerns_identified = parseBool(
                final_payment_data['site_investigation_concerns_identified'])

        # The EoC is only required if it hasn't been provided yet.
        final_eoc_data = final_payment_data.get('final_eoc', [None])[0]
        if not final_payment_data.get('final_eoc', None) and not payment.final_eoc_document:
            raise BadRequest('Evidence of Cost is required!')

        # Create the EoC document and soft-delete the existing one (if it exists).
        if final_eoc_data:
            if payment.final_eoc_document:
                payment.final_eoc_document.active_ind = False
            filename = ApplicationDocument.create_filename(application, payment.work_id,
                                                           'FINAL_EOC', 'xlsx')
            final_eoc = ApplicationDocument(
                document_name=filename,
                object_store_path=final_eoc_data['key'],
                application_document_code='FINAL_EOC')
            application.documents.append(final_eoc)
            application.save()
            payment.final_eoc_application_document_guid = final_eoc.application_document_guid

        # The Final Report is only required if it hasn't been provided yet.
        final_report_data = final_payment_data.get('final_report', [None])[0]
        if not final_report_data and not payment.final_report_document:
            raise BadRequest('Final Report is required!')

        # Create the Final Report document and soft-delete the existing one (if it exists).
        if final_report_data:
            if payment.final_report_document:
                payment.final_report_document.active_ind = False
            filename = ApplicationDocument.create_filename(application, payment.work_id,
                                                           'FINAL_REPORT', 'pdf')
            final_report = ApplicationDocument(
                document_name=filename,
                object_store_path=final_report_data['key'],
                application_document_code='FINAL_REPORT')
            application.documents.append(final_report)
            application.save()
            payment.final_report_application_document_guid = final_report.application_document_guid

        payment.save()
        return '', response_code


class ContractedWorkPaymentInterimReport(Resource, UserMixin):
    @requires_otp_or_admin
    def put(self, application_guid, work_id):
        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the contracted work payment.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            raise BadRequest(
                'Only contracted work items that have had information submitted can have their Interim Progress Report updated'
            )

        # Set the contracted work payment interim report.
        interim_report_data = request.json
        interim_report = interim_report_data['interim_report']
        payment.interim_report = interim_report

        payment.save()
        return '', 200


class AdminContractedWorkPaymentStatusChange(Resource, UserMixin):
    @requires_role_admin
    def post(self, application_guid, work_id):
        # Validate this contracted work item.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the payment status change data.
        payment_status_data = request.json

        # Validate the contracted work payment code.
        contracted_work_payment_code = payment_status_data['contracted_work_payment_code']
        prefix = contracted_work_payment_code.lower()
        if not ContractedWorkPaymentType.find_by_code(contracted_work_payment_code):
            raise BadRequest('Unknown contracted work payment code received!')

        # Validate the contracted work payment status code.
        contracted_work_payment_status_code = payment_status_data[f'{prefix}_payment_status_code']
        if not ContractedWorkPaymentStatus.find_by_code(contracted_work_payment_status_code):
            raise BadRequest('Unknown contracted work payment status code received!')

        # Get the contracted work payment.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            raise BadRequest(
                'The applicant must submit payment information for this work item before its status can be changed'
            )

        # Validate the request to change the final payment status to approved.
        if contracted_work_payment_code == 'FINAL' and contracted_work_payment_status_code == 'APPROVED':
            if payment.interim_payment_status_code != 'APPROVED':
                raise BadRequest('The interim payment must first be approved!')
            if not payment.interim_paid_amount:
                raise BadRequest('The interim payment must have an approved amount set!')
            if not payment.interim_report:
                raise BadRequest('The interim progress report must be provided!')

        note = payment_status_data.get(f'{prefix}_note', None)
        if contracted_work_payment_status_code == 'APPROVED':
            approved_amount = payment_status_data[f'{prefix}_approved_amount']
            if not approved_amount:
                raise BadRequest('The amount to approve must be provided!')

            if contracted_work_payment_code == 'INTERIM':
                payment.interim_paid_amount = approved_amount
            else:
                payment.final_paid_amount = approved_amount

        elif contracted_work_payment_status_code == 'READY_FOR_REVIEW':
            pass
        elif contracted_work_payment_status_code == 'INFORMATION_REQUIRED':
            if not note:
                BadRequest('A note is mandatory for this status!')
        else:
            raise BadRequest('Unknown contracted work payment status code received!')

        status_change = ContractedWorkPaymentStatusChange(
            contracted_work_payment=payment,
            application=application,
            contracted_work_payment_status_code=contracted_work_payment_status_code,
            contracted_work_payment_code=contracted_work_payment_code,
            note=note)
        payment.status_changes.append(status_change)

        payment.save()
        return '', 201
