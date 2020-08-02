import json

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from pytz import timezone
from marshmallow import fields
from werkzeug.exceptions import NotImplemented
from sqlalchemy.ext.hybrid import hybrid_property

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.company_payment_info.models import CompanyPaymentInfo


class PaymentDocument(AuditMixin, Base):
    """
    Local ledger of PRF files in S3 object store and their business relationship
    """

    __tablename__ = 'payment_document'

    class _ModelSchema(Base._ModelSchema):
        document_guid = fields.String(dump_only=True)

    document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('application.guid'))
    document_name = db.Column(db.String, nullable=False)
    object_store_path = db.Column(db.String, nullable=False)

    upload_date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    invoice_number = db.Column(db.String, nullable=False)
    payment_document_type_code = db.Column(
        db.String, db.ForeignKey('payment_document_type.payment_document_code'), nullable=False)

    application = db.relationship('Application')

    @classmethod
    def find_by_guid(cls, application_guid, document_guid):
        return cls.query.filter_by(
            application_guid=application_guid, document_guid=document_guid,
            active_ind=True).first()

    @hybrid_property
    def content_json(self):
        # The application must have at least one reviewed contracted work item
        if not self.application.review_json:
            raise Exception('Application has no approved contracted work items')

        # Get critical company payment info for generating the PRF data
        company_info = CompanyPaymentInfo.find_by_company_name(self.application.company_name)
        if not company_info:
            raise Exception('Essential company payment data is missing')

        # Create the general PRF data
        payment_document_phase = self.payment_document_type_code
        supplier_name = self.application.company_name
        supplier_address = company_info.company_address
        po_number = company_info.po_number
        qualified_receiver_name = company_info.qualified_receiver_name
        expense_authority_name = company_info.expense_authority_name
        date_payment_authorized = datetime.utcnow().astimezone(
            timezone('US/Pacific')).strftime('%B %-d, %Y')
        content_json = {
            'document_type': payment_document_phase,
            'invoice_number': self.invoice_number,
            'supplier_name': supplier_name,
            'supplier_address': supplier_address,
            'po_number': po_number,
            'qualified_receiver_name': qualified_receiver_name,
            'expense_authority_name': expense_authority_name,
            'date_payment_authorized': date_payment_authorized,
            'payment_details': []
        }

        def generate_payment_detail(agreement_number, unique_id, amount):
            return {'agreement_number': agreement_number, 'unique_id': unique_id, 'amount': amount}

        def generate_unique_id(work_id=None):
            unique_id = self.invoice_number
            if (self.payment_document_type_code != 'FIRST_PRF'):
                # Remove the application part of the work ID, e.g., "18.16" becomes "16"
                work_number = work_id.split('.')[1]
                unique_id += f'-{work_number}'
            return unique_id

        # Create the PRF payment details data
        agreement_number = self.application.agreement_number
        if payment_document_phase == 'FIRST_PRF':
            amount = self.application.calc_prf_phase_one_amount()
            unique_id = generate_unique_id()
            content_json['payment_details'].append(
                generate_payment_detail(agreement_number, unique_id, amount))

        elif payment_document_phase == 'INTERIM_PRF':
            raise NotImplemented('Interim-phase PRF document content cannot yet be generated.')

        elif payment_document_phase == 'FINAL_PRF':
            raise NotImplemented('Final-phase PRF document content cannot yet be generated.')

        return json.dumps(content_json, indent=4)
