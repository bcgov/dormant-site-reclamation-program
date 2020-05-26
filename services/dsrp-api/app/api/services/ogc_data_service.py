from urllib.request import urlopen
from http.cookiejar import CookieJar
from io import StringIO
from app.extensions import cache
from app.api.constants import PERMIT_HOLDER_CACHE, DORMANT_WELLS_CACHE, LIABILITY_PER_WELL_CACHE, TIMEOUT_15_MINUTES, TIMEOUT_60_MINUTES, TIMEOUT_12_HOURS, TIMEOUT_1_YEAR
from flask import Flask, current_app
from threading import Thread

import requests
import urllib
import pandas as pd
import pyarrow as pa
import time

from .ogc_data_constants import PERMIT_HOLDER_CSV_DATA, DORMANT_WELLS_CSV_DATA, LIABILITY_PER_WELL_CSV_DATA

# TODO: Stick into environment variables
PERMIT_HOLDER_CSV = 'http://reports.bcogc.ca/ogc/f?p=200:201:14073940726161:CSV::::'
DORMANT_WELLS_CSV = 'https://reports.bcogc.ca/ogc/f?p=200:81:9680316354055:CSV::::'
LIABILITY_PER_WELL_CSV = 'https://reports.bcogc.ca/ogc/f?p=200:10:10256707131131:CSV::::'

session = requests.session()


def refreshOGCdata(app, cache_key, csv_url, process):
    with app.app_context():
        serializer = pa.default_serialization_context()

        data = cache.get(cache_key)
        expiry_token = cache.get(cache_key + '_EXPIRY_TOKEN')

        if not expiry_token:
            current_app.logger.debug(f'OGC DATA SERVICE - {cache_key} - Cached data not found.')
            # set 15 minute token to mitigate multiple threads requesting data at the same time
            cache.set(cache_key + '_EXPIRY_TOKEN', True, timeout=TIMEOUT_15_MINUTES)
        else:
            current_app.logger.debug(f'OGC DATA SERVICE - {cache_key} - Cached data up to date.')
            return

        try:
            cookieProcessor = urllib.request.HTTPCookieProcessor()
            opener = urllib.request.build_opener(cookieProcessor)
            response = session.get(csv_url)

            df = pd.read_table(StringIO(response.text), sep=",")
            df = process(df)

            updated_from_web = True
            current_app.logger.debug(
                f'OGC DATA SERVICE - {cache_key} - Successful get from OGC reporting.')
            df = process(df)

        except:
            # on error, if we don't have data in the cache initialize it from static content
            if not data:
                current_app.logger.debug(
                    f'OGC DATA SERVICE - {cache_key} - Falling back to static content.')
                if cache_key is PERMIT_HOLDER_CACHE:
                    df = pd.read_table(StringIO(PERMIT_HOLDER_CSV_DATA), sep=",")

                if cache_key is DORMANT_WELLS_CACHE:
                    df = pd.read_table(StringIO(DORMANT_WELLS_CSV_DATA), sep=",")

                if cache_key is LIABILITY_PER_WELL_CACHE:
                    df = pd.read_table(StringIO(LIABILITY_PER_WELL_CSV_DATA), sep=",")
            df = process(df)

        row_count = df.shape[0]

        # only update cache if there is a good dataset
        if row_count > 1:
            current_app.logger.debug(f'OGC DATA SERVICE - {cache_key} - Updating cached data.')
            cache.set(
                cache_key,
                serializer.serialize(df).to_buffer().to_pybytes(),
                timeout=TIMEOUT_1_YEAR)

            if updated_from_web:
                cache.set(cache_key + '_EXPIRY_TOKEN', True, timeout=TIMEOUT_60_MINUTES)
        else:
            current_app.logger.warning(
                f'OGC DATA SERVICE - {cache_key} - FAILED TO RETRIEVE UPDATED DATA')


class OGCDataService():
    @classmethod
    def refreshAllData(cls):
        cls.getPermitHoldersDataFrame()
        cls.getDormantWellsDataFrame()
        cls.getLiabilityPerWellDataFrame()

    @classmethod
    def getOGCdataframe(cls, cache_key, csv_url, process):
        serializer = pa.default_serialization_context()
        data = cache.get(cache_key)

        app = current_app._get_current_object()

        #if empty dataset refresh data synchronously, otherwise refresh in the background and continue
        if not data:
            df = refreshOGCdata(app, cache_key, csv_url, process)
        else:
            thread = Thread(
                target=refreshOGCdata, args=(
                    app,
                    cache_key,
                    csv_url,
                    process,
                ))
            thread.daemon = True
            thread.start()

        #update data and return
        data = cache.get(cache_key)
        if data:
            df = serializer.deserialize(data)

        return df

    @classmethod
    def getPermitHoldersDataFrame(cls):
        def process(df):
            df.columns = [
                'operator_id', 'organization_name', 'phone_num', 'address_line_1', 'address_line_2',
                'city', 'province', 'postal_code', 'country'
            ]
            return df

        return cls.getOGCdataframe(PERMIT_HOLDER_CACHE, PERMIT_HOLDER_CSV, process)

    @classmethod
    def getDormantWellsDataFrame(cls):
        def process(df):
            df.columns = [
                'operator_name', 'operator_id', 'well_auth_number', 'well_name', 'dormant_status',
                'current_status', 'well_dormancy_date', 'site_dormancy_date', 'site_dormancy_type',
                'site_dormant_status', 'surface_location', 'field', 'abandonment_date',
                'last_spud_date', 'last_rig_rels_date', 'last_completion_date',
                'last_active_production_year', 'last_active_inj_display_year',
                'wellsite_dormancy_declaration_date', 'multi_well'
            ]
            df['well_dormancy_date'] = pd.to_datetime(
                df['well_dormancy_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['site_dormancy_date'] = pd.to_datetime(
                df['site_dormancy_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['abandonment_date'] = pd.to_datetime(
                df['abandonment_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_spud_date'] = pd.to_datetime(
                df['last_spud_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_rig_rels_date'] = pd.to_datetime(
                df['last_rig_rels_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_completion_date'] = pd.to_datetime(
                df['last_completion_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_active_production_year'] = pd.to_datetime(
                df['last_active_production_year'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['last_active_inj_display_year'] = pd.to_datetime(
                df['last_active_inj_display_year'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            df['wellsite_dormancy_declaration_date'] = pd.to_datetime(
                df['wellsite_dormancy_declaration_date'],
                errors='coerce').apply(lambda x: x.strftime('%Y-%m-%d') if pd.notnull(x) else None)
            return df

        return cls.getOGCdataframe(DORMANT_WELLS_CACHE, DORMANT_WELLS_CSV, process)

    @classmethod
    def getLiabilityPerWellDataFrame(cls):
        def process(df):
            df.columns = [
                'well_auth_number', 'well_name', 'operator_name', 'ad_number', 'mode_code',
                'ops_type', 'deemed_asset', 'abandonment_liability', 'assessment_liability',
                'remediation_liability', 'reclamation_liability', 'total_liability', 'override_flag'
            ]
            return df

        return cls.getOGCdataframe(LIABILITY_PER_WELL_CACHE, LIABILITY_PER_WELL_CSV, process)