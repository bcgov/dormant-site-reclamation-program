import requests, base64, io
from tusclient import client

from flask import Response, current_app
from app.config import Config


class DocumentManagerService():
    document_manager_url = f'{Config.DOCUMENT_MANAGER_URL}/documents'

    @classmethod
    def initializeFileUploadWithDocumentManager(cls, request):
        metadata = cls._parse_request_metadata(request)
        if not metadata or not metadata.get('filename'):
            raise Exception('Request metadata missing filename')

        data = {
            'folder': 'applications',
            'pretty_folder': 'applications',
            'filename': metadata.get('filename')
        }

        resp = requests.post(
            url=cls.document_manager_url,
            headers={key: value
                     for (key, value) in request.headers if key != 'Host'},
            data=data,
            cookies=request.cookies,
        )
        return Response(str(resp.content), resp.status_code, resp.raw.headers.items())

    @classmethod
    def _parse_request_metadata(cls, request):
        request_metadata = request.headers.get("Upload-Metadata")
        metadata = {}
        if not request_metadata:
            return metadata

        for key_value in request_metadata.split(","):
            (key, value) = key_value.split(" ")
            metadata[key] = base64.b64decode(value).decode("utf-8")

        return metadata
