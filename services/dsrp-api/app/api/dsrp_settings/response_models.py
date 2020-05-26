from app.extensions import api
from flask_restplus import fields

DSRP_SETTING = api.model('DSRPSetting', {
    'setting': fields.String,
    'setting_value': fields.Boolean,
})

DSRP_SETTINGS = api.model('DSRPSettings', {'settings': fields.List(fields.Nested(DSRP_SETTING))})
