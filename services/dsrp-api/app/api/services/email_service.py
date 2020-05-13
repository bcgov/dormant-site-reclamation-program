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

session = requests.session()

class EmailService():
    #keys: host,port,user,pwrd

    SENDER_INFO = {
        'name': "BC Gov Dormant Site Reclamation Program",
        'from-email': 'DormantSiteReclamation@gov.bc.ca'
    }
    
    _sent_mail = {
        'success_count':0,
        'errors':[]
    }

    _smtp = None    

    def __init__(self):
        self.SMTP_CRED = Config.SMTP_CRED

    def __enter__(self):
        # set up the SMTP server
        self._smtp = smtplib.SMTP()
        self._smtp.set_debuglevel(0)
        self._smtp.connect(self.SMTP_CRED['host'], self.SMTP_CRED['port'])
        current_app.logger.info(f'Opening connection to {self.SMTP_CRED["host"]}:{self.SMTP_CRED["port"]}')
        return self 

    def __exit__(self, exc_type, exc_value, traceback): 
        if exc_type is not None: 
            current_app.logger.error(f'EmailService.__exit__ values: {exc_type}, {exc_value}, {traceback}')
        
        current_app.logger.info(
            f'Sent {self._sent_mail["success_count"]} emails successfully, {len(self._sent_mail["errors"])} errors. closing connection')
        
        if self._sent_mail['errors']:
            current_app.logger.error(self._sent_mail['errors'])  

        self._smtp.quit()   

    def send_email(self, to_email,subject, msg_content):
        msg = MIMEMultipart()       # create a message

        msg['From']=self.SENDER_INFO['from-email']
        msg['To']=to_email
        msg['Subject']=subject
        # add in the message body
        msg.attach(msg_content)
        
        # send the message via the server set up earlier.
        try:
            self._smtp.send_message(msg)
            self._sent_mail['success_count'] += 1
        except Exception as e: 
            self._sent_mail['errors'].append((msg['To']) + 'THREW' + str(e))
            
            
    def send_application_confirmation(self, application):
        content = f"""
        <html>
            <head></head>
            <body>
            <p> 
                We have successfully received your application in the BC Governments Dormant
                Site Reclamation Program. Your reference number is {application.guid}, please keep this safe as you will
                need it to carry your application forward in this process.
            </p>
            <p>
                Email {self.SENDER_INFO['from-email']} with this reference number if you have questions about your application. 
            </p>
            </body>
        </html>
        """
        msg_content = MIMEText(content,'html')

        self.send_email(application.submitter_email, 'Application Confirmation',msg_content)