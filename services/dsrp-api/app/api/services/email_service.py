import smtplib

from werkzeug.exceptions import InternalServerError
from flask import current_app
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from app.api.utils.include.user_info import User
from app.config import Config


class EmailService():
    def __init__(self):
        if not Config.SMTP_ENABLED:
            return

        self.SMTP_CRED = Config.SMTP_CRED
        self.sent_mail_info = {'success_count': 0, 'errors': []}

    def __enter__(self):
        if not Config.SMTP_ENABLED:
            return self

        self.smtp = None
        if Config.SMTP_IS_TEST_MODE:
            self.smtp = smtplib.SMTP_SSL(Config.SMTP_CRED_HOST, Config.SMTP_PORT)
            self.smtp.set_debuglevel(1)
            self.smtp.ehlo()
            self.smtp.login(Config.SMTP_USER, Config.SMTP_PASSWORD)
        else:
            self.smtp = smtplib.SMTP()
            self.smtp.set_debuglevel(0)
            self.smtp.connect(self.SMTP_CRED['host'], self.SMTP_CRED['port'])

        current_app.logger.info(
            f'Opening connection to {self.SMTP_CRED["host"]}:{self.SMTP_CRED["port"]}')

        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if not Config.SMTP_ENABLED:
            return

        if exc_type is not None:
            current_app.logger.error(
                f'EmailService.__exit__ values: {exc_type}, {exc_value}, {traceback}')

        current_app.logger.info(
            f'Sent {self.sent_mail_info["success_count"]} emails successfully, {len(self.sent_mail_info["errors"])} errors. Closing connection.'
        )

        if self.sent_mail_info['errors']:
            current_app.logger.error(self.sent_mail_info['errors'])

        self.smtp.quit()

    def send_email_to_applicant(self,
                                application,
                                subject,
                                html_content,
                                attachment=None,
                                filename=None):
        if not application.applicant_email:
            raise Exception('Application does not have the applicant email set!')

        from_email = Config.PROGRAM_EMAIL
        to_email = application.applicant_email
        signature = f'<p>Email {Config.PROGRAM_EMAIL} with this reference number if you have questions about your application.</p>'
        html_body = self.create_applicant_email_body(application, html_content)

        self.send_email(to_email, from_email, subject, html_body, signature, attachment, filename)

    def send_payment_document(self, doc, prf_file):
        if not Config.PRF_FROM_EMAIL or not Config.PRF_TO_EMAIL:
            current_app.logger.warning('Email addresses required for emailing finance are not set!')

        from_email = Config.PRF_FROM_EMAIL

        # For more useful testing purposes, if this value is not set, use the email of the current user
        to_email = Config.PRF_TO_EMAIL
        if not to_email:
            to_email = User().get_user_email()
            current_app.logger.warning(
                f'Finance recipient email is not set! Using the email of the current user instead: {to_email}'
            )

        total_amount = '{0:.2f}'.format(doc.content["total_payment"])
        subject = f'{doc.content["po_number"]}, {doc.content["supplier_name"]}, {doc.content["invoice_number"]}, {total_amount}'

        payment_details_rows_html = ''
        for payment_detail in doc.content['payment_details']:
            amount = '{0:.2f}'.format(payment_detail["amount"])
            payment_details_rows_html += f'<tr><td>{payment_detail["agreement_number"]}</td><td>{payment_detail["unique_id"]}</td><td style="text-align: right;">{amount}</td></tr>'

        payment_details_total_row_html = f'<tr><th>Total Amount</th><td></td><td style="text-align: right;">{total_amount}</td></tr>'

        payment_details_table_html = f'''
            <tr><th style="vertical-align: top;">Payment Details</th><td><table><th>Agreement Number</th><th>Unique ID</th><th>Amount</th></tr>
            {payment_details_rows_html}
            {payment_details_total_row_html}</table></td>'''

        table_style = '<style>td, th { padding-right: 50px; } th { text-align: left; }</style>'
        prf_content_html = f'''
            {table_style}
            <h4>Payment Request Form</h4>
            <table>
                <tr><th>PO Number</th><td>{doc.content["po_number"]}</td></tr>
                <tr><th>Supplier Name</th><td>{doc.content["supplier_name"]}</td></tr>
                <tr><th>Supplier Address</th><td>{doc.content["supplier_address"]}</td></tr>
                <tr><th>Invoice Date</th><td>{doc.content["invoice_date"]}</td></tr>
                <tr><th>Invoice Number</th><td>{doc.invoice_number}</td></tr>
                <tr><td><br /></td></tr>
                {payment_details_table_html}
                <tr><td><br /></td></tr>
                <tr><th>Qualified Receiver Names</th><td>{doc.content["qualified_receiver_name"]}</td></tr>
                <tr><th>Expense Authority Name</th><td>{doc.content["expense_authority_name"]}</td></tr>
                <tr><th>Date Payment Authorized</th><td>{doc.content["date_payment_authorized"]}</td></tr>
                <tr><th>Account Coding</th><td>{doc.content["account_coding"]}</td></tr>
            </table>'''

        html_body = f'{prf_content_html}<br /><p>I approve payment for the following attached Payment Request Form under the Dormant Sites Reclamation Program.</p>'
        current_app.logger.info(html_body)
        attachment = prf_file
        filename = doc.document_name

        self.send_email(to_email, from_email, subject, html_body, '', attachment, filename)

    def send_email(self,
                   to_email,
                   from_email,
                   subject,
                   html_body,
                   signature=None,
                   attachment=None,
                   filename=None):
        if Config.SMTP_ENABLED and not self.smtp:
            raise InternalServerError(
                'Email service is enabled but failed to connect to the SMTP server!')
        elif not Config.SMTP_ENABLED:
            current_app.logger.warning('Email service is disabled! Cannot send the email.')
            return

        msg = MIMEMultipart()
        msg['From'] = Config.EMAIL_FROM if Config.SMTP_IS_TEST_MODE else from_email
        msg['Subject'] = f'''[LOCAL]{subject}''' if Config.SMTP_IS_TEST_MODE else subject
        msg['To'] = Config.EMAIL_TO if Config.SMTP_IS_TEST_MODE else to_email

        html = f'<html><head></head><body>{html_body}{signature}</body></html>'
        msg.attach(MIMEText(html, 'html'))

        if attachment:
            file_to_attach = MIMEApplication(attachment.getvalue(), Name=filename)
            file_to_attach['Content-Disposition'] = f'attachment; filename="{filename}"'
            msg.attach(file_to_attach)

        try:
            self.smtp.send_message(msg)
            self.sent_mail_info['success_count'] += 1
        except Exception as e:
            self.sent_mail_info['errors'].append(f'Failed to send email to {to_email}: {str(e)}')

    def create_applicant_email_body(self, application, html_content):
        return f"""
            <div class="WordSection1" style="margin:0;">
                <table class="MsoNormalTable" border="0" cellspacing="0" cellpadding="0" width="100%"
                    style="background:#003366; border-collapse:collapse">
                    <tbody>
                        <tr>
                            <td width="217" colspan="2" valign="top"
                                style="width:163.05pt; border-top:none; border-left:solid windowtext 1.0pt; border-bottom:solid #FCBA19 3.0pt; border-right:none; padding:3mm 0mm 3mm 3mm">
                                <img src="http://news.gov.bc.ca/Content/Images/Gov/gov3_bc_logo.png"
                                    alt="Government of B.C." title="Government of B.C.">
                            </td>
                            <td width="207" colspan="2"
                                style="width:155.05pt; border:none; border-bottom:solid #FCBA19 3.0pt; padding:0cm 0cm 0cm 0cm">
                                <p class="MsoNormal" align="center"
                                    style="margin-bottom:0cm; margin-bottom:.0001pt; text-align:center; line-height:normal">
                                    <span style="font-size:16.0pt; color:white">Dormant Sites Reclamation Program</span>
                                </p>
                            </td>
                            <td width="94" colspan="2"
                                style="width:70.55pt; border:none; border-bottom:solid #FCBA19 3.0pt; padding:0cm 0cm 0cm 0cm">
                                <p class="MsoNormal" align="center"
                                    style="margin-bottom:0cm; margin-bottom:.0001pt; text-align:center; line-height:normal">
                                    <span style="font-size:16.0pt">&nbsp;</span>
                                </p>
                            </td>
                        </tr>
                        <tr style="height:13.6pt">
                            <td width="47" valign="top"
                                style="width:35.45pt; border:none; border-left:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    &nbsp;
                                </p>
                            </td>
                            <td width="184" colspan="2" valign="top"
                                style="width:138.25pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
                                <br/>
                                <br/>
                                <br/>
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    <span style="font-size:12.0pt; color:#595959">Reference Number</span>
                                </p>
                            </td>
                            <td width="232" colspan="2" valign="top"
                                style="width:173.8pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
                                <br/>
                                <br/>
                                <br/>
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    <b><span style="font-size:12.0pt; color:#595959">{application.guid}</span></b>
                                </p>
                            </td>
                            <td width="55" valign="top"
                                style="width:41.15pt; border:none; border-right:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:13.6pt">
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    &nbsp;
                                </p>
                            </td>
                        </tr>
                        <tr style="height:25pt">
                            <td width="47" valign="top"
                                style="width:35.45pt; border:none; border-left:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    &nbsp;
                                </p>
                            </td>
                            <td width="416" colspan="4" valign="top"
                                style="width:312.05pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
                            </td>
                            <td width="55" valign="top"
                                style="width:41.15pt; border:none; border-right:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    &nbsp;
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td width="47" valign="top"
                                style="width:41.15pt; border:none; border-left:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    &nbsp;
                                </p>
                            </td>
                            <td colspan="4" width="416" valign="top"
                                style="width:41.15pt; border:none; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
                                {html_content}
                            </td>
                            <td width="55" valign="top"
                                style="width:41.15pt; border:none; border-right:solid #D9D9D9 1.0pt; background:white; padding:0cm 5.4pt 0cm 5.4pt; height:56.9pt">
                                <p class="MsoNormal" style="margin-bottom:0cm; margin-bottom:.0001pt; line-height:normal">
                                    &nbsp;
                                </p>
                            </td>
                        </tr>
                        <tr style="height:22.3pt">
                            <td width="518" colspan="6"
                                style="border:none; border-top:solid #FCBA19 3.0pt; padding:0cm 5.4pt 0cm 5.4pt; height:22.3pt">
                                <p class="MsoNormal" align="right"
                                    style="margin-bottom:0cm; margin-bottom:.0001pt; text-align:right; line-height:normal">
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td width="59" style="width:44.25pt; padding:0cm 0cm 0cm 0cm"></td>
                            <td width="213" style="width:159.75pt; padding:0cm 0cm 0cm 0cm"></td>
                            <td width="18" style="width:13.5pt; padding:0cm 0cm 0cm 0cm"></td>
                            <td width="241" style="width:180.75pt; padding:0cm 0cm 0cm 0cm"></td>
                            <td width="49" style="width:36.75pt; padding:0cm 0cm 0cm 0cm"></td>
                            <td width="69" style="width:51.75pt; padding:0cm 0cm 0cm 0cm"></td>
                        </tr>
                    </tbody>
                </table>
                <p class="MsoNormal"><span lang="EN-US">&nbsp;</span></p>
                <p class="MsoNormal"><span>&nbsp;</span></p>
            </div>"""
