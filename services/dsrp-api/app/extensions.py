import logging

from flask_caching import Cache
from flask_jwt_oidc import JwtManager
from flask_sqlalchemy import SQLAlchemy

from .config import Config
from .helper import Api

db = SQLAlchemy()
jwt = JwtManager()
cache = Cache()
api = Api(
    prefix='{}'.format(Config.BASE_PATH),
    doc='{}/'.format(Config.BASE_PATH),
    default='dsrp',
    default_label='DSRP related operations',
)
