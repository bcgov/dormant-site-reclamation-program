from urllib.request import urlopen
from http.cookiejar import CookieJar
from io import StringIO
from app.extensions import cache
from app.api.constants import PERMIT_HOLDER_CACHE, DORMANT_WELLS_CACHE, LIABILITY_PER_WELL_CACHE, TIMEOUT_12_HOURS, TIMEOUT_1_YEAR
from flask import current_app

import requests
import urllib
import pandas as pd
import pyarrow as pa

# TODO: Stick into environment variables
PERMIT_HOLDER_CSV = 'http://reports.bcogc.ca/ogc/f?p=200:201:14073940726161:CSV::::'
DORMANT_WELLS_CSV = 'https://reports.bcogc.ca/ogc/f?p=200:81:9680316354055:CSV::::'
LIABILITY_PER_WELL_CSV = 'https://reports.bcogc.ca/ogc/f?p=200:10:10256707131131:CSV::::'

session = requests.session()

class OGCDataService():

    @classmethod
    def getOGCdf(cls, cache_key, csv_url, process):
        serializer = pa.default_serialization_context()
        data = cache.get(cache_key)
        last_modified = cache.get(cache_key + '_LAST_MODIFIED')
        expired = cache.get(cache_key + '_EXPIRY_TOKEN')
        if not expired:
            current_app.logger.debug(f'OGC DATA SERVICE - {cache_key} - Cached data not found.')
            cookieProcessor = urllib.request.HTTPCookieProcessor()
            opener = urllib.request.build_opener(cookieProcessor)
            response = session.get(csv_url)

            df = pd.read_table(StringIO(response.text), sep=",")
            df = process(df)

            row_count = df.shape[0]

            # only update cache if there is a good dataset
            if row_count > 1:
                cache.set(cache_key, serializer.serialize(df).to_buffer().to_pybytes(), timeout=TIMEOUT_1_YEAR)
                cache.set(cache_key + '_LAST_MODIFIED', last_modified, timeout=TIMEOUT_1_YEAR)
                cache.set(cache_key + '_EXPIRY_TOKEN', True, timeout=TIMEOUT_12_HOURS)
            else:
                current_app.logger.warning(f'OGC DATA SERVICE - {cache_key} - FAILED TO RETRIEVE UPDATED DATA')
                df = serializer.deserialize(data)
        else:
            current_app.logger.debug(f'OGC DATA SERVICE - {cache_key} - Cached data found.')
            df = serializer.deserialize(data)

        return df

    @classmethod
    def getPermitHoldersDataFrame(cls):   

        def process(df):
            df.columns = ['operator_id','organization_name','phone_num','address_line_1','address_line_2','city','province','postal_code','country']
            return df

        return cls.getOGCdf(PERMIT_HOLDER_CACHE, PERMIT_HOLDER_CSV, process)

    @classmethod
    def getDormantWellsDataFrame(cls):

        def process(df):
            df.columns = ['operator_name', 'operator_id', 'well_auth_number', 'well_name', 'dormant_status', 'current_status', 'well_dormancy_date', 'site_dormancy_date', 'site_dormancy_type', 'site_dormant_status', 'surface_location', 'field', 'abandonment_date', 'last_spud_date', 'last_rig_rels_date', 'last_completion_date', 'last_active_production_year', 'last_active_inj_display_year', 'multi_well']
            df['well_dormancy_date'] = pd.to_datetime(df['well_dormancy_date'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['site_dormancy_date'] = pd.to_datetime(df['site_dormancy_date'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['abandonment_date'] = pd.to_datetime(df['abandonment_date'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_spud_date'] = pd.to_datetime(df['last_spud_date'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_rig_rels_date'] = pd.to_datetime(df['last_rig_rels_date'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_completion_date'] = pd.to_datetime(df['last_completion_date'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_active_production_year'] = pd.to_datetime(df['last_active_production_year'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_active_inj_display_year'] = pd.to_datetime(df['last_active_inj_display_year'], errors='coerce').apply(lambda x:x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            return df

        return cls.getOGCdf(DORMANT_WELLS_CACHE, DORMANT_WELLS_CSV, process)

    @classmethod
    def getLiabilityPerWellDataFrame(cls):
        
        def process(df):
            df.columns = ['well_auth_number','well_name','operator_name','ad_number','mode_code','ops_type','deemed_asset','abandonment_liability','assessment_liability', 'remediation_liability', 'reclamation_liability', 'total_liability', 'override_flag']
            return df

        return cls.getOGCdf(LIABILITY_PER_WELL_CACHE, LIABILITY_PER_WELL_CSV, process)