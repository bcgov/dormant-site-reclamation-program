import requests
import smtplib

from werkzeug.exceptions import InternalServerError
from flask import current_app
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

from app.config import Config


class EmailService():

    SENDER_INFO = {
        'name': "BC Gov Dormant Site Reclamation Program",
        'from-email': 'DormantSite.BC.Government@gov.bc.ca'
    }

    def __init__(self):
        if not Config.SMTP_ENABLED:
            return

        self.SMTP_CRED = Config.SMTP_CRED
        self.sent_mail_info = {'success_count': 0, 'errors': []}
        self.signature = f'<p>Email {self.SENDER_INFO["from-email"]} with this reference number if you have questions about your application.</p>'

    def __enter__(self):
        if not Config.SMTP_ENABLED:
            return self

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
            f'Sent {self.sent_mail_info["success_count"]} emails successfully, {len(self.sent_mail_info["errors"])} errors. closing connection'
        )

        if self.sent_mail_info['errors']:
            current_app.logger.error(self.sent_mail_info['errors'])

        self.smtp.quit()

    def send_email(self, to_email, subject, html_body, attachment=None, filename=None):
        if Config.SMTP_ENABLED and not self.smtp:
            raise InternalServerError('Failed to connect to the SMTP server!')
        elif not Config.SMTP_ENABLED:
            current_app.logger.warning(f'Email service is disabled! Cannot send the email.')
            return

        msg = MIMEMultipart()
        msg['From'] = self.SENDER_INFO['from-email']
        msg['To'] = to_email
        msg['Subject'] = subject

        html = "<html><head></head><body>" + html_body + self.signature + "</body></html>"
        msg.attach(MIMEText(html, 'html'))

        if attachment:
            file_to_attach = MIMEApplication(attachment.getvalue(), Name=filename)
            file_to_attach['Content-Disposition'] = 'attachment; filename="%s"' % filename
            msg.attach(file_to_attach)

        try:
            self.smtp.send_message(msg)
            self.sent_mail_info['success_count'] += 1
        except Exception as e:
            self.sent_mail_info['errors'].append((msg['To']) + 'THREW' + str(e))
