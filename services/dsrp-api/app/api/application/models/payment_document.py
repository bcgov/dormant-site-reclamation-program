import io
import json

from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from marshmallow import fields
from werkzeug.exceptions import NotImplemented, BadRequest
from sqlalchemy.ext.hybrid import hybrid_property

from app.extensions import db
from app.api.utils.models_mixins import AuditMixin, Base
from app.api.company_payment_info.models import CompanyPaymentInfo
from app.api.application.models.payment_document_type import PaymentDocumentType
from app.api.application.models.payment_document_contracted_work_payment_xref import PaymentDocumentContractedWorkPaymentXref
from app.api.contracted_work.models.contracted_work_payment import ContractedWorkPayment
from app.api.services.object_store_storage_service import ObjectStoreStorageService
from app.api.services.document_generator_service import DocumentGeneratorService, get_template_file_path
from app.api.services.email_service import EmailService
from app.config import Config


class PaymentDocument(AuditMixin, Base):
    """
    Local ledger of PRF files in S3 object store and their business relationship
    """

    __tablename__ = 'payment_document'

    def __init__(self, application, work_ids=None, **kwargs):
        super(PaymentDocument, self).__init__(**kwargs)

        def create_invoice_number(application):
            all_application_payment_documents = PaymentDocument.query.filter_by(
                application_guid=application.guid).all()
            amount_generated = sum(doc.payment_document_code == self.payment_document_code
                                   for doc in all_application_payment_documents)
            payment_phase = None
            if self.payment_document_code == 'FIRST_PRF':
                payment_phase = 1
            elif self.payment_document_code == 'INTERIM_PRF':
                payment_phase = 2
            elif self.payment_document_code == 'FINAL_PRF':
                payment_phase = 3
            else:
                raise Exception('Unknown payment document code')
            agreement_number = application.agreement_number
            invoice_number = f'{agreement_number}-{payment_phase}-{amount_generated + 1}'
            return invoice_number

        def create_payment_details():
            def create_payment_detail(unique_id, well_authorization_number, amount):
                return {
                    'agreement_number': self.application.agreement_number,
                    'unique_id': unique_id,
                    'well_authorization_number': well_authorization_number,
                    'amount': float(amount)
                }

            def create_unique_id(work_id=None):
                unique_id = self.invoice_number
                if (self.payment_document_code != 'FIRST_PRF'):
                    # Remove the application ID part of the work ID, e.g., "18.16" becomes "16"
                    work_number = work_id.split('.')[1]
                    unique_id += f'-{work_number}'
                return unique_id

            payment_details = []
            if self.payment_document_code == 'FIRST_PRF':
                amount = self.application.calc_first_prf_amount()
                unique_id = create_unique_id()
                well_authorization_numbers = ', '.join([
                    cw['well_authorization_number']
                    for cw in self.application.contracted_work('APPROVED', False)
                ])
                payment_details.append(
                    create_payment_detail(unique_id, well_authorization_numbers, amount))

            elif self.payment_document_code in ('INTERIM_PRF', 'FINAL_PRF'):
                for contracted_work_payment in self.contracted_work_payments:
                    if not contracted_work_payment:
                        raise Exception(f'Contracted work payment is none!')

                    work_id = contracted_work_payment.work_id
                    work = self.application.find_contracted_work_by_id(work_id)
                    if not work:
                        raise Exception(f'Work ID {work_id} does not exist on this application!')

                    if work.get('contracted_work_status_code', None) != 'APPROVED':
                        raise Exception(f'Work ID {work_id} is not approved!')

                    amount = None
                    if self.payment_document_code == 'INTERIM_PRF':
                        if contracted_work_payment.interim_payment_status_code != 'APPROVED':
                            raise Exception(
                                f'Work ID {work_id} interim payment has not been approved!')
                        amount = contracted_work_payment.interim_paid_amount
                        if not amount:
                            raise Exception(
                                f'Work ID {work_id} interim payment amount has not been set!')
                    else:
                        if contracted_work_payment.final_payment_status_code != 'APPROVED':
                            raise Exception(
                                f'Work ID {work_id} final payment has not been approved!')
                        amount = contracted_work_payment.final_paid_amount
                        if not amount:
                            raise Exception(
                                f'Work ID {work_id} final payment amount has not been set!')

                    unique_id = create_unique_id(work_id)
                    well_authorization_number = work['well_authorization_number']
                    payment_details.append(
                        create_payment_detail(unique_id, well_authorization_number, amount))
            else:
                raise Exception('Unknown payment document code')

            return payment_details

        def create_content():
            company_name = self.application.company_name
            company_info = CompanyPaymentInfo.find_by_company_name(company_name)
            if not company_info:
                raise Exception(f'Essential company payment info for {company_name} is missing')

            today_date = datetime.now().strftime('%B %-d, %Y')

            account_coding = '057.2700A.26505.8001.2725067'
            supplier_name = company_info.company_name
            supplier_address = company_info.company_address
            invoice_date = today_date
            invoice_number = self.invoice_number
            po_number = company_info.po_number
            qualified_receiver_name = company_info.qualified_receiver_name
            date_payment_authorized = today_date
            expense_authority_name = company_info.expense_authority_name

            payment_details = create_payment_details()
            if not payment_details:
                raise BadRequest('Payment details cannot be empty!')

            total_payment = sum([payment_detail['amount'] for payment_detail in payment_details])

            return {
                'account_coding': account_coding,
                'supplier_name': supplier_name,
                'supplier_address': supplier_address,
                'invoice_date': invoice_date,
                'invoice_number': invoice_number,
                'po_number': po_number,
                'qualified_receiver_name': qualified_receiver_name,
                'date_payment_authorized': date_payment_authorized,
                'expense_authority_name': expense_authority_name,
                'payment_details': payment_details,
                'total_payment': total_payment
            }

        def upload_prf(prf_file):
            document_name = f'{self.invoice_number}_{self.payment_document_code.lower()}.xlsx'
            file_path = f'{self.application.guid}/{self.payment_document_code.lower()}/{document_name}'
            try:
                self.object_store_path = ObjectStoreStorageService().upload_fileobj(
                    prf_file, file_path)
                self.document_name = document_name
                self.upload_date = datetime.utcnow()
            except Exception as e:
                raise Exception(f'Failed to upload the PRF: {e}')

        self.invoice_number = create_invoice_number(application)
        self.application = application
        self.payment_document_type = PaymentDocumentType.find_by_payment_document_code(
            self.payment_document_code)

        if self.payment_document_code != 'FIRST_PRF':
            if work_ids is None:
                raise Exception(f'Work IDs must be provided!')

            for work_id in work_ids:
                contracted_work_payment = ContractedWorkPayment.find_by_work_id(work_id)
                if not contracted_work_payment:
                    raise Exception(f'Work ID has no payment information!')
                self.contracted_work_payments.append(contracted_work_payment)

        self.content = create_content()

        # Generate the PRF
        resp = DocumentGeneratorService.generate_document_and_stream_response(
            get_template_file_path('payment-request-form'), self.content, 'xlsx')

        # Upload the PRF
        upload_prf(io.BytesIO(resp.content))

        # Email the PRF
        try:
            with EmailService() as es:
                es.send_payment_document(self, io.BytesIO(resp.content))
        except Exception as e:
            raise Exception(f'Failed to email the PRF: {e}')

    class _ModelSchema(Base._ModelSchema):
        document_guid = fields.String(dump_only=True)

    application_guid = db.Column(
        UUID(as_uuid=True), db.ForeignKey('application.guid'), nullable=False)
    document_guid = db.Column(UUID(as_uuid=True), primary_key=True, server_default=FetchedValue())
    document_name = db.Column(db.String, nullable=False)
    object_store_path = db.Column(db.String, nullable=False)
    upload_date = db.Column(db.Date, nullable=False)
    active_ind = db.Column(db.Boolean, nullable=False, server_default=FetchedValue())

    invoice_number = db.Column(db.String, nullable=False)
    payment_document_code = db.Column(
        db.String, db.ForeignKey('payment_document_type.payment_document_code'), nullable=False)
    content = db.Column(JSONB, nullable=False)

    application = db.relationship('Application', lazy='selectin')
    payment_document_type = db.relationship('PaymentDocumentType', lazy='selectin')
    contracted_work_payments = db.relationship(
        'ContractedWorkPayment',
        lazy='selectin',
        secondary='payment_document_contracted_work_payment_xref')

    @classmethod
    def find_by_guid(cls, application_guid, document_guid):
        return cls.query.filter_by(
            application_guid=application_guid, document_guid=document_guid,
            active_ind=True).one_or_none()
