DROP VIEW IF EXISTS work_info_view;
CREATE OR REPLACE VIEW work_info_view
	AS SELECT
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