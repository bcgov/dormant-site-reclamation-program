from flask_restplus import Namespace

from app.api.nominated_well_site.resources.nominated_well_site import NominatedWellSiteListResource

api = Namespace('nominatedwell', description='Nominated well sites endpoint')

api.add_resource(NominatedWellSiteListResource, '')