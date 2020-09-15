from app.config import Config

ONE_TIME_LINK = "OTL"
ONE_TIME_PASSWORD = "OTP"


def ONE_TIME_LINK_FRONTEND_URL(otl_guid):
    return f"{Config.URL}/request-access/{otl_guid}"