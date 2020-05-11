def DOWNLOAD_TOKEN(token_guid):
    return f'document-manager:download-token:{token_guid}'

#Deep Update Special Flag
STATE_MODIFIED_DELETE_ON_PUT = "delete"

#Cache Timeouts
TIMEOUT_5_MINUTES = 300
TIMEOUT_60_MINUTES = 3600
TIMEOUT_24_HOURS = 86340
TIMEOUT_12_HOURS = 43140

# This constant is defined for use during the app setup and creation.
# See static_data.py in utils for its use and the values it contains.
STATIC_DATA = {}
