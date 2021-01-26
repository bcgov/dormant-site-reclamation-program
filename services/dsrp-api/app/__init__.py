import logging
from logging.config import dictConfig

from flask import Flask, request

from flask_cors import CORS
from flask_restplus import Resource, apidoc
from sqlalchemy.exc import SQLAlchemyError
from marshmallow.exceptions import MarshmallowError

from flask_jwt_oidc.exceptions import AuthError
from werkzeug.exceptions import Forbidden, BadRequest

from app.api.application.namespace import api as application_api
from app.api.exports.namespace import api as exports_api
from app.api.permit_holder.namespace import api as permit_holder_api
from app.api.well.namespace import api as well_api
from app.api.liability.namespace import api as liability_api
from app.api.orgbook.namespace import api as orgbook_api
from app.api.documents.namespace import api as download_api
from app.api.dsrp_settings.namespace import api as dsrp_settings_api
from app.api.authorization.namespace import api as authorization
from app.api.nominated_well_site.namespace import api as nominate_well_site_api

from app.commands import register_commands
from app.config import Config
from app.extensions import db, jwt, api, cache

import app.api.utils.setup_marshmallow


def create_app(test_config=None):
    """Create and configure an instance of the Flask application."""
    if test_config is None:
        dictConfig(Config.LOGGING_DICT_CONFIG)
    app = Flask(__name__)

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_object(Config)
    else:
        # load the test config if passed in
        app.config.from_object(test_config)

    register_extensions(app)
    register_routes(app)
    register_commands(app)

    with app.app_context():
        from sqlalchemy.orm import configure_mappers
        configure_mappers()

        from app.api.services.ogc_data_service import OGCDataService
        OGCDataService.refreshAllData()

    return app


def register_extensions(app):

    api.app = app
    # Overriding swaggerUI base path to serve content under a prefix
    apidoc.apidoc.static_url_path = '{}/swaggerui'.format(Config.BASE_PATH)
    api.init_app(app)

    try:
        jwt.init_app(app)
    except Exception as error:
        app.logger.error("Failed to initialize JWT library: " + str(error))

    cache.init_app(app)
    db.init_app(app)

    CORS(app)

    return None


def register_routes(app):
    # Set URL rules for resources
    app.add_url_rule('/', endpoint='index')

    api.add_namespace(dsrp_settings_api)
    api.add_namespace(exports_api)
    api.add_namespace(application_api)
    api.add_namespace(download_api)
    api.add_namespace(permit_holder_api)
    api.add_namespace(well_api)
    api.add_namespace(liability_api)
    api.add_namespace(orgbook_api)
    api.add_namespace(authorization)
    api.add_namespace(nominate_well_site_api)

    # Healthcheck endpoint
    @api.route('/health')
    class Healthcheck(Resource):
        def get(self):
            return {'status': 'pass'}

    @api.errorhandler(AuthError)
    def jwt_oidc_auth_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'status_code', 401),
            'message': str(error),
        }, getattr(error, 'status_code', 401)

    @api.errorhandler(Forbidden)
    def forbidden_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'status_code', 403),
            'message': str(error),
        }, getattr(error, 'status_code', 403)

    @api.errorhandler(AssertionError)
    def assertion_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'code', 400),
            'message': str(error),
        }, getattr(error, 'code', 400)

    # Recursively add handler to every SQLAlchemy Error
    def sqlalchemy_error_handler(error):
        app.logger.error(str(error))
        app.logger.error(type(error))
        return {
            'status': getattr(error, 'status_code', 400),
            'message': str(error),
        }, getattr(error, 'status_code', 400)

    def _add_sqlalchemy_error_handlers(classname):
        for subclass in classname.__subclasses__():
            (api.errorhandler(subclass))(sqlalchemy_error_handler)

            if len(subclass.__subclasses__()) != 0:
                _add_sqlalchemy_error_handlers(subclass)

    _add_sqlalchemy_error_handlers(SQLAlchemyError)

    @api.errorhandler(Exception)
    def default_error_handler(error):
        app.logger.error(str(error))
        app.logger.error('REQUEST\n' + str(request))
        app.logger.error('HEADERS\n ' + str(request.headers))
        return {
            'status': getattr(error, 'code', 500),
            'message': str(error),
        }, getattr(error, 'code', 500)
