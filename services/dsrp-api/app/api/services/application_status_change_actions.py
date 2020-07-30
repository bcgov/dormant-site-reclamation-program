from flask import current_app
import json
from werkzeug.exceptions import BadRequest

from app.api.company.models import Company


def determine_application_status_change_action(application):
    """Performs various actions according to the status of the application."""

    most_recent_status_change = application.status_changes[
        0] if application.status_changes and len(
            application.status_changes) > 0 else None
    if not most_recent_status_change:
        return

    status = most_recent_status_change.application_status_code
    # if status == 'FIRST_PAY_APPROVED':
    action_first_pay_approved(application)


def action_first_pay_approved(application):
    """Changing an application's status to FIRST_PAY_APPROVED triggers the following events:\
        1) Generate and store the Phase 1 PRF document required by finance.\
        2) This document is sent via email to the required email address.
    """

    if not application.review_json:
        raise BadRequest('Application has no approved contracted work items')

    # Get the PO number and address associated with the application's company
    company = Company.find_by_company_name(application.company_name)
    if not company:
        raise BadRequest('Essential company data is missing')
    company_address = company.company_address
    po_number = company.po_number

    # Get this application's well site data
    well_sites = application.well_sites_with_review_data
    # current_app.logger.info(json.dumps(well_sites))

    # Calculate the sum of the approved work for this application
    # app_total = 0
    # for i, well_site in enumerate(well_sites):
    #     for cw_type, cw_data in well_site.get('contracted_work', {}).items():
    #         if cw_data.get('contracted_work_status_code', None) != 'APPROVED':
    #             continue
    #         app_total += cw_data['contracted_work_total']

    # Applicant's receive 10% of 50% of the approved work
    # amount = (app_total / 2) / 10

    dcj = application.shared_cost_agreement_template_json
    current_app.logger.info(json.dumps(dcj))

    # current_app.logger.info(app_total)
