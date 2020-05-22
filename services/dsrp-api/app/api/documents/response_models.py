from app.extensions import api
from flask_restplus import fields

DOWNLOAD_TOKEN_MODEL = api.model('DownloadToken', {'token_guid': fields.String})