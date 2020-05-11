from flask_restplus import Resource, fields
from app.extensions import api

from app.api.utils.resources_mixins import UserMixin
from app.api.submission.models.submission import Submission
from app.api.submission.response_models import SUBMISSION


class SubmissionListResource(Resource, UserMixin):
    @api.doc(description='This endpoint returns a list of all submissions.')
    @api.marshal_with(SUBMISSION, code=200, envelope='records')
    def get(self):
        records = {"submission_id": 1, "json": "TESTING"}
        return records

    @api.doc(description='This endpoint returns a list of all submissions.')
    @api.marshal_with(SUBMISSION, code=200, envelope='records')
    def post(self):
        records = {"submission_id": 1, "json": "TESTING"}
        return records
