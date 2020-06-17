DROP VIEW IF EXISTS applications_view;
CREATE OR REPLACE VIEW applications_view
	AS
select id, guid, submission_date,
       "public"."application"."json" #>> '{review, reviewed_and_verified}' as reviewed_and_verified, 
             "public"."application"."json" #>> '{review_program_conditions, accept_program_details_and_requirements}' as accept_program_indicator,
             "public"."application"."json" #>> '{company_details, company_name, label}' as company_name, 
             "public"."application"."json" #>> '{company_details, business_number}' as business_number,
             "public"."application"."json" #>> '{company_details, address_line_1}' as address_line_1,
             "public"."application"."json" #>> '{company_details, address_line_2}' as address_line_2,
             "public"."application"."json" #>> '{company_details, city}' as city,
             "public"."application"."json" #>> '{company_details, province}' as province,
             "public"."application"."json" #>> '{company_details, postal_code}' as postal_code,
             "public"."application"."json" #>> '{company_contact, fax}' as fax,
             "public"."application"."json" #>> '{company_contact, email}' as email1,
             "public"."application"."json" #>> '{company_contact, email2}' as email2,
             "public"."application"."json" #>> '{company_contact, last_name}' as last_name,
             "public"."application"."json" #>> '{company_contact, first_name}' as first_name,
             "public"."application"."json" #>> '{company_contact, phone_ext_1}' as ext1,
             "public"."application"."json" #>> '{company_contact, phone_number_1}' as phone1,
             "public"."application"."json" #>> '{company_contact, phone_ext_2}' as ext2,
             "public"."application"."json" #>> '{company_contact, phone_number_2}' as phone2,
             "public"."application"."json" #>> '{contract_details, operator_id}' as operator_id,
             "public"."application"."json" #>> '{company_details, indigenous_participation_ind}' as indigenous_participation,
             "public"."application"."json" #>> '{company_details, indigenous_participation_description}' as indigenous_participation_description
      FROM "public"."application"
;

--View of All Well Sites by Application
create view Well_Sites_Vw as
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

--View of All Work Info by Well
create view Work_Info_Vw as SELECT
id, guid, well_authorization_number,
contracted_work_type, planned_start_date, planned_end_date,
well_file_review, abandonment_plan,mob_demob_site,camp_lodging,permanent_plugging_wellbore, cut_and_cap, removal_of_facilities, historical_well_file,
site_visit, report_writing_submission, psi_review, intrusive_sampling, submission_of_samples, completion_of_notifications,analysis_results,psi_review_dsi_scope, complete_sampling,
analysis_lab_results,development_remediation_plan,technical_report_writing, surface_recontouring,topsoil_replacement, revegetation_monitoring, excavation,contaminated_soil, confirmatory_sampling,
backfilling_excavation, risk_assessment, site_closure,
estimated_cost
    
FROM (
    SELECT
        *,
        contracted_work_data->>'planned_start_date' as planned_start_date,
        contracted_work_data->>'planned_end_date' as planned_end_date,
        COALESCE(NULLIF(contracted_work_data->>'well_file_review', '')::numeric, 0) as well_file_review,
        COALESCE(NULLIF(contracted_work_data->>'abandonment_plan', '')::numeric, 0)  as abandonment_plan,
        COALESCE(NULLIF(contracted_work_data->>'mob_demob_site', '')::numeric, 0)  as mob_demob_site,
        COALESCE(NULLIF(contracted_work_data->>'camp_lodging', '')::numeric, 0)  as camp_lodging,
        COALESCE(NULLIF(contracted_work_data->>'permanent_plugging_wellbore', '')::numeric, 0) as permanent_plugging_wellbore,
        COALESCE(NULLIF(contracted_work_data->>'cut_and_cap', '')::numeric, 0) as cut_and_cap,
        COALESCE(NULLIF(contracted_work_data->>'removal_of_facilities', '')::numeric, 0) as removal_of_facilities,
        COALESCE(NULLIF(contracted_work_data->>'historical_well_file', '')::numeric, 0) as historical_well_file,
                COALESCE(NULLIF(contracted_work_data->>'site_visit', '')::numeric, 0) as site_visit,
                COALESCE(NULLIF(contracted_work_data->>'report_writing_submission', '')::numeric, 0) as report_writing_submission,
                COALESCE(NULLIF(contracted_work_data->>'psi_review', '')::numeric, 0) as psi_review,
                COALESCE(NULLIF(contracted_work_data->>'intrusive_sampling', '')::numeric, 0) as intrusive_sampling,
                COALESCE(NULLIF(contracted_work_data->>'submission_of_samples', '')::numeric, 0) as submission_of_samples,
                COALESCE(NULLIF(contracted_work_data->>'completion_of_notifications', '')::numeric, 0) as completion_of_notifications,
                COALESCE(NULLIF(contracted_work_data->>'analysis_results', '')::numeric, 0) as analysis_results,
                COALESCE(NULLIF(contracted_work_data->>'psi_review_dsi_scope', '')::numeric, 0) as psi_review_dsi_scope,
                COALESCE(NULLIF(contracted_work_data->>'complete_sampling', '')::numeric, 0) as complete_sampling,
                COALESCE(NULLIF(contracted_work_data->>'analysis_lab_results', '')::numeric, 0) as analysis_lab_results,
                COALESCE(NULLIF(contracted_work_data->>'development_remediation_plan', '')::numeric, 0) as development_remediation_plan,
                COALESCE(NULLIF(contracted_work_data->>'technical_report_writing', '')::numeric, 0) as technical_report_writing,
                COALESCE(NULLIF(contracted_work_data->>'surface_recontouring', '')::numeric, 0) as surface_recontouring,
                COALESCE(NULLIF(contracted_work_data->>'topsoil_replacement', '')::numeric, 0) as topsoil_replacement,
                COALESCE(NULLIF(contracted_work_data->>'revegetation_monitoring', '')::numeric, 0) as revegetation_monitoring,
                COALESCE(NULLIF(contracted_work_data->>'excavation', '')::numeric, 0) as excavation,
                COALESCE(NULLIF(contracted_work_data->>'contaminated_soil', '')::numeric, 0) as contaminated_soil,
                COALESCE(NULLIF(contracted_work_data->>'confirmatory_sampling', '')::numeric, 0) as confirmatory_sampling,
                COALESCE(NULLIF(contracted_work_data->>'backfilling_excavation', '')::numeric, 0) as backfilling_excavation,
                COALESCE(NULLIF(contracted_work_data->>'risk_assessment', '')::numeric, 0) as risk_assessment,
                COALESCE(NULLIF(contracted_work_data->>'site_closure', '')::numeric, 0) as site_closure,
                
        CASE
            WHEN (contracted_work_type = 'abandonment') THEN
                COALESCE(NULLIF(contracted_work_data->>'well_file_review', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'abandonment_plan', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'mob_demob_site', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'camp_lodging', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'permanent_plugging_wellbore', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'cut_and_cap', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'removal_of_facilities', '')::numeric, 0)
                
            WHEN (contracted_work_type = 'preliminary_site_investigation') THEN
                COALESCE(NULLIF(contracted_work_data->>'historical_well_file', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'site_visit', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'report_writing_submission', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'psi_review', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'mob_demob_site', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'camp_lodging', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'intrusive_sampling', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'submission_of_samples', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'completion_of_notifications', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'analysis_results', '')::numeric, 0)
                
            WHEN (contracted_work_type = 'detailed_site_investigation') THEN
                COALESCE(NULLIF(contracted_work_data->>'psi_review_dsi_scope', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'mob_demob_site', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'camp_lodging', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'complete_sampling', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'analysis_lab_results', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'development_remediation_plan', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'technical_report_writing', '')::numeric, 0)
                
            WHEN (contracted_work_type = 'reclamation') THEN
                COALESCE(NULLIF(contracted_work_data->>'mob_demob_site', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'camp_lodging', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'surface_recontouring', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'topsoil_replacement', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'revegetation_monitoring', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'technical_report_writing', '')::numeric, 0)
                
            WHEN (contracted_work_type = 'remediation') THEN
                COALESCE(NULLIF(contracted_work_data->>'mob_demob_site', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'camp_lodging', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'excavation', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'contaminated_soil', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'confirmatory_sampling', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'backfilling_excavation', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'risk_assessment', '')::numeric, 0) +
                COALESCE(NULLIF(contracted_work_data->>'site_closure', '')::numeric, 0)
                
            ELSE -1
        END as estimated_cost
    FROM (
        SELECT
            *,
            to_jsonb(contracted_work)->'value' as contracted_work_data
        FROM (
            SELECT
                *,
                application.json #>> '{company_details, company_name, label}' as company_name,
                application.well_site #>> '{details,well_authorization_number}' as well_authorization_number,
                jsonb_object_keys(application.well_site #> '{contracted_work}') as contracted_work_type,
                jsonb_each(application.well_site #> '{contracted_work}') as contracted_work
            FROM (
                SELECT
                    id,
                    guid,
                    application.json,
                    jsonb_array_elements(application.json -> 'well_sites') as well_site
                FROM
                    application
            ) as application
            
        ) as application_well_site
        
    ) as application_well_site_contracted_work_data
    
) as application_well_site_contracted_work

ORDER By id, guid;