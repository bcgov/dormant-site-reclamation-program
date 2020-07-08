
UPDATE application SET json_backup=json;


CREATE OR REPLACE FUNCTION add_well_ids_to_json()
  RETURNS trigger AS
$BODY$
DECLARE 
    rec record;
BEGIN	
	FOR rec IN 
	
	
	SELECT
	    id,
	    guid,
	    well_authorization_number,
	    contracted_work_type,
		application_well_site_contracted_work.well_index,
		ROW_NUMBER () OVER (
			PARTITION BY id, well_index
			ORDER BY id, well_index, contracted_work_type
		)-1 as work_index,
		concat(id, '.', ROW_NUMBER () OVER (
			PARTITION BY id
			ORDER BY id, well_index, contracted_work_type
		)) as work_id
	FROM (
	    SELECT
	        *,
	        contracted_work_data->>'planned_start_date' as planned_start_date,
	        contracted_work_data->>'planned_end_date' as planned_end_date
			
	    FROM (
	        SELECT
	            *,
	            to_jsonb(contracted_work)->'value' as contracted_work_data
	        FROM (
	            SELECT
	                *,
	                application.json #>> '{company_details, company_name, label}' as company_name,
	                COALESCE(NULLIF(application.json #>> '{company_details, indigenous_participation_ind}', '')::boolean, false) as indigenous_participation_ind,
	                application.well_site #>> '{details,well_authorization_number}' as well_authorization_number,
	                application.well_site #> '{site_conditions}' as site_conditions,
	                jsonb_object_keys(application.well_site #> '{contracted_work}') as contracted_work_type,
	                jsonb_each(application.well_site #> '{contracted_work}') as contracted_work
	            FROM (
	                SELECT 
	                    id,
	                    guid,
	                    (submission_date at time zone 'America/Los_Angeles') as submission_date,
	                    application.json,
	                    permit_holder.organization_name as permit_holder_organization_name,
	                    t.well_site,
	                    t.idx-1 as well_index
	                FROM
	                    application,
	                    permit_holder,
	                    jsonb_array_elements(application.json -> 'well_sites') with ordinality as t(well_site, idx)
	                WHERE permit_holder.operator_id = (application.json #>> '{contract_details, operator_id}')::int
	                AND application.id = NEW.id
	            ) as application
	            
	        ) as application_well_site
	        
	    ) as application_well_site_contracted_work_data
	    
	) as application_well_site_contracted_work

	ORDER BY id, well_index, work_index ASC
	
	LOOP
	
	UPDATE application SET json=jsonb_set(json, concat('{well_sites,', rec.well_index::int ,',contracted_work,', rec.contracted_work_type,'}')::text[],jsonb_set(json->'well_sites'->rec.well_index::int->'contracted_work'->rec.contracted_work_type, '{work_id}', rec.work_id::text::jsonb))
	WHERE guid=(rec.guid);
	
	
	END LOOP;
	RETURN NULL;

END;
$BODY$ LANGUAGE plpgsql;





BEGIN TRANSACTION;

DO $$
DECLARE 
    rec record;
BEGIN

FOR rec IN 

	SELECT
	    id,
	    guid,
	    well_authorization_number,
	    contracted_work_type,
		application_well_site_contracted_work.well_index,
		ROW_NUMBER () OVER (
			PARTITION BY id, well_index
			ORDER BY id, well_index, contracted_work_type
		)-1 as work_index,
		concat(id, '.', ROW_NUMBER () OVER (
			PARTITION BY id
			ORDER BY id, well_index, contracted_work_type
		)) as work_id
	FROM (
	    SELECT
	        *,
	        contracted_work_data->>'planned_start_date' as planned_start_date,
	        contracted_work_data->>'planned_end_date' as planned_end_date
			
	    FROM (
	        SELECT
	            *,
	            to_jsonb(contracted_work)->'value' as contracted_work_data
	        FROM (
	            SELECT
	                *,
	                application.json #>> '{company_details, company_name, label}' as company_name,
	                COALESCE(NULLIF(application.json #>> '{company_details, indigenous_participation_ind}', '')::boolean, false) as indigenous_participation_ind,
	                application.well_site #>> '{details,well_authorization_number}' as well_authorization_number,
	                application.well_site #> '{site_conditions}' as site_conditions,
	                jsonb_object_keys(application.well_site #> '{contracted_work}') as contracted_work_type,
	                jsonb_each(application.well_site #> '{contracted_work}') as contracted_work
	            FROM (
	                SELECT 
	                    id,
	                    guid,
	                    (submission_date at time zone 'America/Los_Angeles') as submission_date,
	                    application.json,
	                    permit_holder.organization_name as permit_holder_organization_name,
	                    t.well_site,
	                    t.idx-1 as well_index
	                FROM
	                    application,
	                    permit_holder,
	                    jsonb_array_elements(application.json -> 'well_sites') with ordinality as t(well_site, idx)
	                WHERE permit_holder.operator_id = (application.json #>> '{contract_details, operator_id}')::int
	            ) as application
	            
	        ) as application_well_site
	        
	    ) as application_well_site_contracted_work_data
	    
	) as application_well_site_contracted_work

	ORDER BY id, well_index, work_index ASC
	
	LOOP
	
	UPDATE application SET json=jsonb_set(json, concat('{well_sites,', rec.well_index::int ,',contracted_work,', rec.contracted_work_type,'}')::text[],jsonb_set(json->'well_sites'->rec.well_index::int->'contracted_work'->rec.contracted_work_type, '{work_id}', rec.work_id::text::jsonb))
	WHERE guid=(rec.guid);
	


END LOOP;

END;$$;

COMMIT TRANSACTION;
