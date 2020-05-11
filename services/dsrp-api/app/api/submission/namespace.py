from flask_restplus import Namespace

from app.api.submission.resources.submission import SubmissionListResource

api = Namespace('submission', description='')

api.add_resource(SubmissionListResource, '')
