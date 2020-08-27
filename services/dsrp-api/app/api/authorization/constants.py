ONE_TIME_LINK = "OTL"
ONE_TIME_PASSWORD = "OTP"
ONE_TIME_LINK_GENERATE_URL = "http://localhost:3000"


def ONE_TIME_LINK_CACHE_KEY(otl_guid):
    return f'{ONE_TIME_LINK}:{otl_guid}'


def ONE_TIME_PASSWORD_CACHE_KEY(otp_guid):
    return f'{ONE_TIME_PASSWORD}:{otp_guid}'