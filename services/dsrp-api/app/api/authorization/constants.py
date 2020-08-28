from app.config import Config

ONE_TIME_LINK = "OTL"
ONE_TIME_PASSWORD = "OTP"


def ONE_TIME_LINK_FRONTEND_URL(otl_guid):
    return f"{Config.URL}request-access/{otl_guid}"


def ONE_TIME_LINK_CACHE_KEY(otl_guid):
    return f'{ONE_TIME_LINK}:{otl_guid}'


def ONE_TIME_PASSWORD_CACHE_KEY(otp_guid):
    return f'{ONE_TIME_PASSWORD}:{otp_guid}'