DROP VIEW IF EXISTS well_sites_view;
CREATE OR REPLACE VIEW well_sites_view
	AS
SELECT
id, guid, operator_id, well_authorization_number, permit_holder_organization_name,
within_1000m_stream,
on_or_near_reserve_lands,
on_crown_land_winter_access,
within_active_area_trapping,
within_sensitive_watersheds,
within_500m_groundwater_well,
drilled_abandonded_prior_1997,
permit_holider_notice_dormant,
within_1500m_private_residence,
within_treaty_land_entitlement,
suspected_offsite_contamination,
within_environmental_protection,
located_agricultural_land_reserve,
permit_holder_work_specified_2020_awp
    
FROM (
    SELECT
                *,
                application.well_site #>> '{details,well_authorization_number}' as well_authorization_number,
                application.well_site #>> '{site_conditions,within_1000m_stream}' as within_1000m_stream,
                application.well_site #>> '{site_conditions,on_or_near_reserve_lands}' as on_or_near_reserve_lands,
                application.well_site #>> '{site_conditions,on_crown_land_winter_access}' as on_crown_land_winter_access,
                application.well_site #>> '{site_conditions,within_active_area_trapping}' as within_active_area_trapping,
                application.well_site #>> '{site_conditions,within_sensitive_watersheds}' as within_sensitive_watersheds,
                application.well_site #>> '{site_conditions,within_500m_groundwater_well}' as within_500m_groundwater_well,
                application.well_site #>> '{site_conditions,drilled_abandonded_prior_1997}' as drilled_abandonded_prior_1997,
                application.well_site #>> '{site_conditions,permit_holider_notice_dormant}' as permit_holider_notice_dormant,
                application.well_site #>> '{site_conditions,within_1500m_private_residence}' as within_1500m_private_residence,
                application.well_site #>> '{site_conditions,within_treaty_land_entitlement}' as within_treaty_land_entitlement,
                application.well_site #>> '{site_conditions,suspected_offsite_contamination}' as suspected_offsite_contamination,
                application.well_site #>> '{site_conditions,within_environmental_protection}' as within_environmental_protection,
                application.well_site #>> '{site_conditions,located_agricultural_land_reserve}' as located_agricultural_land_reserve,
                application.well_site #>> '{site_conditions,permit_holder_work_specified_2020_awp}' as permit_holder_work_specified_2020_awp
            FROM (
                SELECT
                    id,
                    guid,
                    (submission_date at time zone 'America/Los_Angeles') as submission_date,
                    application.json,
                    jsonb_array_elements(application.json -> 'well_sites') as well_site,
                    permit_holder.operator_id,
                    permit_holder.organization_name as permit_holder_organization_name
                FROM
                    application,
                    permit_holder
                WHERE permit_holder.operator_id = (application.json #>> '{contract_details, operator_id}')::int
            ) as application
            
        ) as application_well_site
;
