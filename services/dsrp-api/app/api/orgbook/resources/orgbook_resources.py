import json
import requests

from flask import request, current_app
from flask_restplus import Resource

from app.extensions import api
from app.api.utils.access_decorators import requires_role_view_all
from app.api.services.orgbook_service import OrgBookService
from werkzeug.exceptions import BadGateway


class SearchResource(Resource):
    @api.doc(
        description='Search OrgBook.',
        params={'search': 'The search term to use when searching OrgBook.'})
    def get(self):
        search = request.args.get('search')
        resp = OrgBookService.search(search)

        if resp.status_code != requests.codes.ok:
            message = f'OrgBook API responded with {resp.status_code}: {resp.reason}'
            current_app.logger.error(f'SearchResource.get: {message}\nresp.text:\n{resp.text}')
            raise BadGateway(message)

        try:
            results = json.loads(resp.text)['results']
        except:
            message = 'OrgBook API responded with unexpected data.'
            current_app.logger.error(f'SearchResource.get: {message}\nresp.text:\n{resp.text}')
            raise BadGateway(message)

        return results


class CredentialResource(Resource):
    @api.doc(description='Get information on an OrgBook credential.')
    def get(self, credential_id):

        # Get the credential data for this credential ID
        resp = OrgBookService.get_credential(credential_id)
        if resp.status_code != requests.codes.ok:
            message = f'OrgBook API (get_credential) responded with {resp.status_code}: {resp.reason}'
            current_app.logger.error(
                f'CredentialResource get_credential: {message}\nresp.text:\n{resp.text}')
            raise BadGateway(message)

        # Get the topic ID from the credential data
        credential_data = json.loads(resp.text)
        topic_id = credential_data['topic']['id']

        # Get the business number data using the topic ID
        resp = OrgBookService.get_business_number(topic_id)
        if resp.status_code != requests.codes.ok:
            message = f'OrgBook API (get_business_number) responded with {resp.status_code}: {resp.reason}'
            current_app.logger.warning(
                f'CredentialResource get_business_number: {message}\nresp.text:\n{resp.text}')

        # Get the business number from the business number data
        business_number = None
        try:
            business_number_data = json.loads(resp.text)
            results = business_number_data['results']
            for result in results:
                for attribute in result['attributes']:
                    if attribute['type'] == 'business_number':
                        business_number = attribute['value']
                        break
                if business_number:
                    break
        except:
            pass

        # Set the business number (if it was found) in the credential data
        if business_number is None:
            message = f'OrgBook API (get_business_number) did not contain the business number'
            current_app.logger.warning(f'CredentialResource get_business_number: {message}')
        credential_data['business_number'] = business_number

        return credential_data
