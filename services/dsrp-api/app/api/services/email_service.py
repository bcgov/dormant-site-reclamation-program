from os.path import basename
from urllib.request import urlopen
from app.extensions import cache
from app.api.constants import PERMIT_HOLDER_CACHE, DORMANT_WELLS_CACHE, LIABILITY_PER_WELL_CACHE, TIMEOUT_12_HOURS, TIMEOUT_1_YEAR
from flask import current_app
from app.config import Config

import requests
import urllib
import smtplib

from string import Template

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication

session = requests.session()


class EmailService():
    #keys: host,port,user,pwrd

    SENDER_INFO = {
        'name': "BC Gov Dormant Site Reclamation Program",
        'from-email': 'DormantSite.BC.Government@gov.bc.ca'
    }

    signature = None
    _smtp = None

    def __init__(self):
        self._sent_mail = {'success_count': 0, 'errors': []}

        self.SMTP_CRED = Config.SMTP_CRED
        self.signature = f'<p>Email {self.SENDER_INFO["from-email"]} with this reference number if you have questions about your application.</p>'

    def __enter__(self):
        if Config.SMTP_ENABLED:
            # set up the SMTP server
            self._smtp = smtplib.SMTP()
            self._smtp.set_debuglevel(0)
            self._smtp.connect(self.SMTP_CRED['host'], self.SMTP_CRED['port'])
            current_app.logger.info(
                f'Opening connection to {self.SMTP_CRED["host"]}:{self.SMTP_CRED["port"]}')
        else:
            current_app.logger.info(
                f'EmailService disabled, change SMTP_CRED_HOST env variable to go live')
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        if exc_type is not None:
            current_app.logger.error(
                f'EmailService.__exit__ values: {exc_type}, {exc_value}, {traceback}')

        current_app.logger.info(
            f'Sent {self._sent_mail["success_count"]} emails successfully, {len(self._sent_mail["errors"])} errors. closing connection'
        )

        if self._sent_mail['errors']:
            current_app.logger.error(self._sent_mail['errors'])

        if Config.SMTP_ENABLED:
            self._smtp.quit()

    def send_email(self, to_email, subject, html_body, attachment=None, filename=None):
        if Config.SMTP_ENABLED and not self._smtp:
            raise Exception('Initialize EmailService() as context manager using \'with\' keyword')

        msg = MIMEMultipart()

        msg['From'] = self.SENDER_INFO['from-email']
        msg['To'] = to_email
        msg['Subject'] = subject
        # add in the message body

        html = "<html><head></head><body>" + html_body + self.signature + "</body></html>"
        msg.attach(MIMEText(html, 'html'))

        if attachment:
            file_to_attach = MIMEApplication(attachment.getvalue(), Name=filename)
            file_to_attach['Content-Disposition'] = 'attachment; filename="%s"' % filename
            msg.attach(file_to_attach)

        # send the message via the server set up earlier.
        try:
            if Config.SMTP_ENABLED:
                self._smtp.send_message(msg)
            self._sent_mail['success_count'] += 1
        except Exception as e:
            self._sent_mail['errors'].append((msg['To']) + 'THREW' + str(e))
