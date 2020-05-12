from flask_restplus import Namespace

from app.api.well.resources.well import WellListResource

api = Namespace('well', description='Well endpoints')

api.add_resource(WellListResource, '')