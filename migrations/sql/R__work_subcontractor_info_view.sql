DROP VIEW IF EXISTS work_subcontractor_info_view;

CREATE OR REPLACE VIEW work_subcontractor_info_view AS
SELECT
    id as application_id,
    guid as application_guid,
    work_id,
    well_authorization_number,
    contracted_work_type,
    indigenous_subcontractor_name,
    indigenous_affiliation,
    indigenous_communities
FROM (
    SELECT
        *,
        contracted_work_data->>'work_id' as work_id,
        indigenous_subcontractors->>'indigenous_subcontractor_name' as indigenous_subcontractor_name,        
        indigenous_subcontractors->>'indigenous_affiliation' as indigenous_affiliation,
        jsonb_array_elements_text(indigenous_subcontractors #> '{indigenous_communities}') as indigenous_communities
    FROM (
        SELECT
            *,
            to_jsonb(contracted_work)->'value' as contracted_work_data,
            jsonb_array_elements((to_jsonb(contracted_work)->'value') #> '{indigenous_subcontractors}') as indigenous_subcontractors
        FROM (
            SELECT
                *,
                lpad((application.well_site #>> '{details,well_authorization_number}'), 5, '0') as well_authorization_number,
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
                WHERE application_phase_code = 'NOMINATION'
            ) as application
        ) as application_well_site
    ) as application_well_site_contracted_work_data
) as application_well_site_contracted_work

ORDER BY id;
