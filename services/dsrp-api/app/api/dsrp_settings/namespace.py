from flask_restplus import Namespace

from app.api.dsrp_settings.resources.dsrp_settings import DSRPSettingsResource

api = Namespace('settings', description='App settings endpoints')

api.add_resource(DSRPSettingsResource, '')
