from datetime import datetime
from flask_restplus import Resource
from flask import current_app, request
from werkzeug.exceptions import NotFound, BadRequest, Unauthorized

from app.api.utils.access_decorators import requires_role_admin
from app.api.utils.resources_mixins import UserMixin
from app.api.application.models.application import Application
from app.api.application.models.application_document import ApplicationDocument
from app.api.contracted_work.models.contracted_work_payment import ContractedWorkPayment
from app.api.contracted_work.models.contracted_work_payment_status_change import ContractedWorkPaymentStatusChange
from app.api.utils.access_decorators import ADMIN


def validate_application_contracted_work(application, work_id):
    if application is None:
        raise NotFound('No application was found matching the provided reference number')

    contracted_work = application.find_contracted_work_by_id(work_id)
    if contracted_work is None:
        raise NotFound(
            'No contracted work matching the provided work ID was found on that application')

    if contracted_work.get('contracted_work_status_code', None) != 'APPROVED':
        raise BadRequest('This contracted work item is not approved!')


class ContractedWorkPaymentInterim(Resource, UserMixin):
    # TODO: Protect me with OTP
    def put(self, application_guid, work_id):
        response_code = 200

        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the contracted work payment or create it if it doesn't exist.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            payment = ContractedWorkPayment(
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
                contracted_work_payment_status_code='READY_FOR_REVIEW',
                contracted_work_payment_code='INTERIM')
            payment.final_payment_status_changes.append(status_change)

        # Update the required data points.
        interim_payment_data = request.json
        payment.interim_total_hours_worked_to_date = interim_payment_data[
            'interim_total_hours_worked_to_date']
        payment.interim_number_of_workers = interim_payment_data['interim_number_of_workers']
        payment.interim_actual_cost = interim_payment_data['interim_actual_cost']

        # Create the EoC document and soft-delete the existing one (if it exists).
        if payment.interim_eoc_document:
            payment.interim_eoc_document.active_ind = False
        interim_eoc_data = interim_payment_data['interim_eoc'][0]
        interim_eoc = ApplicationDocument(
            document_name=interim_eoc_data['filename'],
            object_store_path=interim_eoc_data['key'],
            application_document_code='INTERIM_EOC')
        application.documents.append(interim_eoc)
        application.save()
        payment.interim_eoc_application_document_guid = interim_eoc.application_document_guid

        payment.save()
        return '', response_code


class ContractedWorkPaymentFinal(Resource, UserMixin):
    # TODO: Protect me with OTP
    def put(self, application_guid, work_id):
        response_code = 200

        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the contracted work payment or create it if it doesn't exist.
        # TODO: Determine if we should create it OR send a bad request indicating that you must submit Interim info first.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            payment = ContractedWorkPayment(
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
                contracted_work_payment_status_code='READY_FOR_REVIEW',
                contracted_work_payment_code='FINAL')
            payment.final_payment_status_changes.append(status_change)

        # Update the required data points.
        final_payment_data = request.json
        payment.final_total_hours_worked_to_date = final_payment_data[
            'final_total_hours_worked_to_date']
        payment.final_number_of_workers = final_payment_data['final_number_of_workers']
        payment.final_actual_cost = final_payment_data['final_actual_cost']
        payment.work_completion_date = final_payment_data['work_completion_date']

        # Create the EoC document and soft-delete the existing one (if it exists).
        if payment.final_eoc_document:
            payment.final_eoc_document.active_ind = False
        final_eoc_data = final_payment_data['final_eoc'][0]
        final_eoc = ApplicationDocument(
            document_name=final_eoc_data['filename'],
            object_store_path=final_eoc_data['key'],
            application_document_code='FINAL_EOC')
        application.documents.append(final_eoc)
        application.save()
        payment.final_eoc_application_document_guid = final_eoc.application_document_guid

        # Create the Final Report document and soft-delete the existing one (if it exists).
        if payment.final_report_document:
            payment.final_report_document.active_ind = False
        final_report_data = final_payment_data['final_report'][0]
        final_report = ApplicationDocument(
            document_name=final_report_data['filename'],
            object_store_path=final_report_data['key'],
            application_document_code='FINAL_REPORT')
        application.documents.append(final_report)
        application.save()
        payment.final_report_application_document_guid = final_report.application_document_guid

        payment.save()
        return '', response_code


class ContractedWorkPaymentInterimReport(Resource, UserMixin):
    # TODO: Protect me with OTP
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


class ContractedWorkPaymentStatus(Resource, UserMixin):
    @requires_role_admin
    def post(self, application_guid, work_id):
        # Ensure that this work item exists on this application.
        application = Application.find_by_guid(application_guid)
        validate_application_contracted_work(application, work_id)

        # Get the contracted work payment or create it if it doesn't exist.
        payment = ContractedWorkPayment.find_by_work_id(work_id)
        if not payment:
            raise BadRequest(
                'The applicant must submit payment information for this work item before its initial status can be changed'
            )

        # Create the contracted work payment status change.
        payment_status_data = request.json
        contracted_work_payment_code = payment_status_data['contracted_work_payment_code']

        # Final payments can only be approved if the interim report has been submitted.
        # if contracted_work_payment_code == 'FINAL':
        #     if not payment.interim_report:
        #         raise BadRequest('The interim progress report must be provided.')

        contracted_work_payment_status_code = payment_status_data[
            'contracted_work_payment_status_code']
        note = payment_status_data['note']
        status_change = ContractedWorkPaymentStatusChange(
            contracted_work_payment_status_code=contracted_work_payment_status_code,
            contracted_work_payment_code=contracted_work_payment_code,
            note=note)
        if contracted_work_payment_code == 'INTERIM':
            payment.interim_payment_status_changes.append(status_change)
        if contracted_work_payment_code == 'FINAL':
            payment.final_payment_status_changes.append(status_change)

        payment.save()
        return '', 201
