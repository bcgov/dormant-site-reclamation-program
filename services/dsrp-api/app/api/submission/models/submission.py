from datetime import datetime
from app.extensions import db
from sqlalchemy.schema import FetchedValue

from app.api.utils.models_mixins import AuditMixin, Base


class Submission(Base):
    __tablename__ = 'submission'
    submission_id = db.Column(db.Integer, primary_key=True, server_default=FetchedValue())
    messagebody = db.Column(db.String, nullable=False)

    def __repr__(self):
        return '<Submission %r>' % self.json
