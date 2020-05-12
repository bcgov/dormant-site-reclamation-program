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
        'reply-email ': 'no-reply-dsrp@gov.bc.ca'
    }
    
    _sent_mail = {
        'success_count':0,
        'error':[]
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
        current_app.logger.info(
            f'Sent {self._sent_mail["success_count"]} emails successfully closing connection')
        # Terminate the SMTP session and close the connection
        ##check to make sure all emails were sent properly before logging
        self._smtp.quit()

    def send_email(self, to_email,subject):
        msg = MIMEMultipart()       # create a message

        message = 'SENDING EMAILS ALL NIGHT LONG'

        print(message)

        msg['From']='test@DCRP.com'
        msg['To']=to_email
        msg['Subject']=subject
        # add in the message body
        msg.attach(MIMEText(message, 'plain'))
        
        # send the message via the server set up earlier.
        try:
            self._server.send_message(msg)
            self._sent_mail['success_count'] += 1
        except Exception as e: 
            #self._sent_mail['error'].append(str(msg) + '>>>' + str(e))
            current_app.logger.error(e)
            
        