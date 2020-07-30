from flask import current_app

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

    # Get the PO number and address associated with the application's company.
    company = Company.find_by_company_name(application.company_name)
    if not company:
        raise BadRequest('Essential company data is missing')
    company_address = company.company_address
    po_number = company.po_number

    # Generate the body of the Phase 1 PRF document.
    well_site_reviews = application.review_json.get('well_sites')
    current_app.logger.info(f'well_site_reviews: {well_site_reviews}')
    well_sites = application.json.get('well_sites')
    for review in well_site_reviews:
        for i, (well_auth_no, review_data) in enumerate(review.items()):
            # current_app.logger.info(
            #     f'well_auth_no: {well_auth_no} data: {review_data}')
            for k, v in review_data.items():
                if k == 'contracted_work':
                    well_sites[i]['contracted_work']
