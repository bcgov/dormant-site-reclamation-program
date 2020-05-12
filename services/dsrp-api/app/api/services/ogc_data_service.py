from urllib.request import urlopen
from http.cookiejar import CookieJar
from io import StringIO
from app.extensions import cache
from app.api.constants import PERMIT_HOLDER_CACHE, DORMANT_WELLS_CACHE, LIABILITY_PER_WELL_CACHE, TIMEOUT_12_HOURS
from flask import current_app

import requests
import urllib
import pandas as pd
import pyarrow as pa

PERMIT_HOLDER_CSV = 'http://reports.bcogc.ca/ogc/f?p=200:201:14073940726161:CSV::::'
DORMANT_WELLS_CSV = 'https://reports.bcogc.ca/ogc/f?p=200:81:9680316354055:CSV::::'
LIABILITY_PER_WELL_CSV = 'https://reports.bcogc.ca/ogc/f?p=200:10:10256707131131:CSV::::'

session = requests.session()

class OGCDataService():

    @classmethod
    def getOGCDataFrame(cls, cache_key, csv_url):
        serializer = pa.default_serialization_context()
        data = cache.get(cache_key)
        last_modified = cache.get(cache_key + '_LAST_MODIFIED')
        if not data:
            cookieProcessor = urllib.request.HTTPCookieProcessor()
            opener = urllib.request.build_opener(cookieProcessor)
            response = session.get(csv_url)

            dataframe = pd.read_table(StringIO(response.text), sep=",")

            cache.set(cache_key, serializer.serialize(dataframe).to_buffer().to_pybytes(), timeout=TIMEOUT_12_HOURS)
            cache.set(cache_key + '_LAST_MODIFIED', last_modified, timeout=TIMEOUT_12_HOURS)
        else:
            dataframe = serializer.deserialize(data)

        return dataframe

    @classmethod
    def getPermitHoldersDataFrame(cls):
        dataframe = cls.getOGCDataFrame(PERMIT_HOLDER_CACHE, PERMIT_HOLDER_CSV)
        dataframe.columns = ['operator_id','organization_name','phone_num','address_line_1','address_line_2','city','province','postal_code','country']
        return dataframe

    @classmethod
    def getDormantWellsDataFrame(cls):
        dataframe = cls.getOGCDataFrame(DORMANT_WELLS_CACHE, DORMANT_WELLS_CSV)
        dataframe.columns = ['operator_name', 'operator_id', 'well_auth_number', 'well_name', 'dormant_status', 'current_status', 'well_dormancy_date', 'site_dormancy_date', 'site_dormancy_type', 'site_dormant_status', 'surface_location', 'field', 'abandonment_date', 'last_spud_date', 'last_rig_rels_date', 'last_completion_date', 'last_active_production_year', 'last_active_inj_display_year', 'multi_well']
        return dataframe

    @classmethod
    def getLiabilityPerWellDataFrame(cls):
        dataframe = cls.getOGCDataFrame(LIABILITY_PER_WELL_CACHE, LIABILITY_PER_WELL_CSV)        
        dataframe.columns = ['well_auth_number','well_name','operator_name','ad_number','mode_code','ops_type','deemed_asset','abandonment_liability','assessment_liability', 'remediation_liability', 'reclamation_liability', 'total_liability', 'override_flag']
        return dataframe