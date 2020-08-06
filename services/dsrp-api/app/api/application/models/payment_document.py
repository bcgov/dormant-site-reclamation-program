import io
import json

from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields
from werkzeug.exceptions import NotImplemented
from sqlalchemy.ext.hybrid import hybrid_property

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.company_payment_info.models import CompanyPaymentInfo
from app.api.application.models.payment_document_type import PaymentDocumentType
from app.api.services.object_store_storage_service import ObjectStoreStorageService
from app.api.services.email_service import EmailService
from app.config import Config


class PaymentDocument(AuditMixin, Base):
    """
    Local ledger of PRF files in S3 object store and their business relationship
    """

    __tablename__ = 'payment_document'

    def __init__(self, application, **kwargs):
        super(PaymentDocument, self).__init__(**kwargs)

        def create_invoice_number(application):
            amount_generated = sum(
                map(lambda doc: doc.payment_document_code == self.payment_document_code,
                    application.payment_documents))
            payment_phase = None
            if self.payment_document_code == 'FIRST_PRF':
                payment_phase = 1
            elif self.payment_document_code == 'INTERIM_PRF':
                payment_phase = 2
            elif self.payment_document_code == 'FINAL_PRF':
                payment_phase = 3
            else:
                raise Exception('Unknown payment document phase')
            agreement_number = application.agreement_number
            invoice_number = f'{agreement_number}-{payment_phase}-{amount_generated + 1}'
            return invoice_number

        def upload_contents():
            document_name = f'{self.invoice_number}_{self.payment_document_code.lower()}.txt'
            file_path = f'{self.application.guid}/{self.payment_document_code.lower()}/{document_name}'
            try:
                self.object_store_path = ObjectStoreStorageService().upload_string(
                    self.content_text, file_path)
                self.document_name = document_name
                self.upload_date = datetime.utcnow()
            except Exception as e:
                raise Exception(f'Failed to upload the PRF: {e}')

        self.invoice_number = create_invoice_number(application)
        self.application = application
        self.payment_document_type = PaymentDocumentType.find_by_payment_document_code(
            self.payment_document_code)
        upload_contents()

    class _ModelSchema(Base._ModelSchema):
        document_guid = fields.String(dump_only=True)

    application_guid = db.Column(UUID(as_uuid=True), db.ForeignKey('application.guid'))
    document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    document_name = db.Column(db.String, nullable=False)
    object_store_path = db.Column(db.String, nullable=False)
    upload_date = db.Column(db.Date, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    invoice_number = db.Column(db.String, nullable=False)
    payment_document_code = db.Column(
        db.String, db.ForeignKey('payment_document_type.payment_document_code'), nullable=False)
    work_ids = db.Column(ARRAY(db.String))

    application = db.relationship('Application')
    payment_document_type = db.relationship('PaymentDocumentType')

    @classmethod
    def find_by_guid(cls, application_guid, document_guid):
        return cls.query.filter_by(
            application_guid=application_guid, document_guid=document_guid,
            active_ind=True).first()

    @hybrid_property
    def company_info(self):
        company_info = CompanyPaymentInfo.find_by_company_name(self.application.company_name)
        if not company_info:
            raise Exception('Essential company payment info is missing')
        return company_info

    @hybrid_property
    def payment_details(self):
        def create_payment_detail(unique_id, amount):
            return {
                'agreement_number': self.application.agreement_number,
                'unique_id': unique_id,
                'amount': amount
            }

        def create_unique_id(work_id=None):
            unique_id = self.invoice_number
            if (self.payment_document_code != 'FIRST_PRF'):
                # Remove the application part of the work ID, e.g., "18.16" becomes "16"
                work_number = work_id.split('.')[1]
                unique_id += f'-{work_number}'
            return unique_id

        payment_details = []
        if self.payment_document_code == 'FIRST_PRF':
            amount = self.application.calc_prf_phase_one_amount()
            unique_id = create_unique_id()
            payment_details.append(create_payment_detail(unique_id, amount))

        elif self.payment_document_code in ('INTERIM_PRF', 'FINAL_PRF'):
            calc_cost = self.application.calc_est_shared_cost_interim_phase if self.payment_document_code == 'INTERIM_PRF' else self.application.calc_est_shared_cost_final_phase
            for work_id in self.work_ids:
                work = self.application.find_contracted_work_by_id(work_id)
                if not work:
                    raise Exception(f'Work ID {work_id} does not exist on this application!')
                amount = calc_cost(work)
                unique_id = create_unique_id(work_id)
                payment_details.append(create_payment_detail(unique_id, amount))
        else:
            raise Exception('Unknown payment document phase')

        return payment_details

    @hybrid_property
    def content_json(self):
        company_info = self.company_info
        supplier_name = self.application.company_name
        supplier_address = company_info.company_address
        po_number = company_info.po_number
        qualified_receiver_name = company_info.qualified_receiver_name
        expense_authority_name = company_info.expense_authority_name
        date_payment_authorized = datetime.now().strftime('%B %-d, %Y')

        content_json = {
            'document_type': self.payment_document_code,
            'invoice_number': self.invoice_number,
            'supplier_name': supplier_name,
            'supplier_address': supplier_address,
            'po_number': po_number,
            'account_coding': '057.2700A.26505.8001.2725067',
            'qualified_receiver_name': qualified_receiver_name,
            'date_payment_authorized': date_payment_authorized,
            'expense_authority_name': expense_authority_name,
            'payment_details': self.payment_details
        }

        return json.dumps(content_json, indent=4)

    @hybrid_property
    def content_text(self):
        content_json = json.loads(self.content_json)
        text = (f'Document Type\n{content_json["document_type"]}\n\n'
                f'Invoice Number\n{content_json["invoice_number"]}\n\n'
                f'Supplier Name\n{content_json["supplier_name"]}\n\n'
                f'Supplier Address\n{content_json["supplier_address"]}\n\n'
                f'PO Number\n{content_json["po_number"]}\n\n'
                f'Account Coding\n{content_json["account_coding"]}\n\n'
                f'Qualified Receiver\n{content_json["qualified_receiver_name"]}\n\n'
                f'Date Payment Authorized\n{content_json["date_payment_authorized"]}\n\n'
                f'Expense Authority\n{content_json["expense_authority_name"]}\n\n'
                f'Payment Details\n'
                f'Agreement Number\t\tUnique ID\t\tAmount\n')

        for payment_detail in content_json['payment_details']:
            text += f'{payment_detail["agreement_number"]}\t\t{payment_detail["unique_id"]}\t\t{payment_detail["amount"]}\n'

        return text

    @hybrid_property
    def content_json_as_bytes(self):
        return io.BytesIO(bytearray(self.content_json, 'utf-8'))

    @hybrid_property
    def content_text_as_bytes(self):
        return io.BytesIO(bytearray(self.content_text, 'utf-8'))
