import json
import requests

from flask import request, current_app
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService
from werkzeug.exceptions import BadRequest, InternalServerError, NotFound, BadGateway


class SearchResource(Resource):
    @api.doc(
        description='Search OrgBook.',
        params={'search': 'The search term to use when searching OrgBook.'})
    def get(self):
        search = request.args.get('search')
        resp = OrgBookService.search(search)

        if resp.status_code != requests.codes.ok:
            message = f'OrgBook API responded with {resp.status_code}: {resp.reason}'
            current_app.logger.error(
                f'SearchResource.get: {message}\nresp.text:\n{resp.text}')
            raise BadGateway(message)

        try:
            results = json.loads(resp.text)['results']
        except:
            message = 'OrgBook API responded with unexpected data.'
            current_app.logger.error(
                f'SearchResource.get: {message}\nresp.text:\n{resp.text}')
            raise BadGateway(message)

        return results


class CredentialResource(Resource):
    @api.doc(description='Get information on an OrgBook credential.')
    def get(self, credential_id):
        resp = OrgBookService.get_credential(credential_id)

        if resp.status_code != requests.codes.ok:
            message = f'OrgBook API responded with {resp.status_code}: {resp.reason}'
            current_app.logger.error(
                f'CredentialResource.get: {message}\nresp.text:\n{resp.text}')
            raise BadGateway(message)

        credential = json.loads(resp.text)
        return credential
