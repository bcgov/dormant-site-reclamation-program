from flask_restplus import Namespace

from app.api.exports.static_content.resources.static_content_resource import StaticContentResource

api = Namespace('exports', description='Static content')

api.add_resource(StaticContentResource, '/static-content')
