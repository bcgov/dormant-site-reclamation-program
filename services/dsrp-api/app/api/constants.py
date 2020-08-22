def DOWNLOAD_TOKEN(token_guid):
    return f'dsrp:s3-download-token:{token_guid}'


# Deep Update Special Flag
STATE_MODIFIED_DELETE_ON_PUT = "delete"

# Cache Timeouts
TIMEOUT_5_MINUTES = 300
TIMEOUT_15_MINUTES = 900
TIMEOUT_60_MINUTES = 3600
TIMEOUT_24_HOURS = 86340
TIMEOUT_12_HOURS = 43140
TIMEOUT_1_YEAR = 31540000

# Cache Keys
STATIC_CONTENT_KEY = "dsrp:static_content"
PERMIT_HOLDER_CACHE = "dsrp:ogc_data:permit_holders"
DORMANT_WELLS_CACHE = "dsrp:ogc_data:dormant_wells"
LIABILITY_PER_WELL_CACHE = "dsrp:ogc_data:liability_per_well"

# This constant is defined for use during the app setup and creation.
# See static_data.py in utils for its use and the values it contains.
STATIC_DATA = {}

# Pagination
DEFAULT_PAGE_NUMBER = 1
PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100, 250]
DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[2]

#settings
DISABLE_APP_SUBMIT_SETTING = 'disable_applications'

WELL_SITE_CONTRACTED_WORK = {
    'abandonment': [
        'well_file_review', 'abandonment_plan', 'mob_demob_site', 'camp_lodging',
        'permanent_plugging_wellbore', 'cut_and_cap', 'removal_of_facilities'
    ],
    'preliminary_site_investigation': [
        'historical_well_file', 'site_visit', 'report_writing_submission', 'psi_review',
        'mob_demob_site', 'camp_lodging', 'intrusive_sampling', 'submission_of_samples',
        'completion_of_notifications', 'analysis_results'
    ],
    'detailed_site_investigation': [
        'psi_review_dsi_scope', 'mob_demob_site', 'camp_lodging', 'complete_sampling',
        'analysis_lab_results', 'development_remediation_plan', 'technical_report_writing'
    ],
    'remediation': [
        'mob_demob_site', 'camp_lodging', 'excavation', 'contaminated_soil',
        'confirmatory_sampling', 'backfilling_excavation', 'risk_assessment', 'site_closure'
    ],
    'reclamation': [
        'mob_demob_site', 'camp_lodging', 'surface_recontouring', 'topsoil_replacement',
        'revegetation_monitoring', 'technical_report_writing'
    ]
}

APPLICATION_JSON = {
    'review': ['reviewed_and_verified'],
    'company_contact': ['email', 'last_name', 'first_name', 'phone_number_1'],
    'company_details':
    ['city', 'province', 'postal_code', 'company_name', 'address_line_1', 'business_number'],
    'contract_details': ['operator_id'],
    'review_program_conditions': ['accept_program_details_and_requirements'],
}

COMPANY_NAME_JSON_KEYS = [
    'key',
    'label',
]
