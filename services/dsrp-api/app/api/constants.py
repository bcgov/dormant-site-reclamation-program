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
PAGE_DEFAULT = 1
PER_PAGE_DEFAULT = 25

#settings

DISABLE_APP_SUBMIT_SETTING = "disable_applications"
