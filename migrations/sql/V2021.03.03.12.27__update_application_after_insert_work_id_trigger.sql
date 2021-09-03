-- Create a backup of the json field for all of the applications that failed to have the function set the work IDs
UPDATE application
SET json_backup = json
WHERE id IN (
	SELECT id
	FROM work_info_view wiv
	WHERE wiv.work_id IS NULL
);


-- Update the function with the new logic to correctly insert the work IDs
CREATE OR REPLACE FUNCTION add_well_ids_to_json() RETURNS trigger AS
$BODY$
DECLARE 
    rec record;
BEGIN

FOR rec IN 

	SELECT
	    id,
	    guid,
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
	        *
	    FROM (
	        SELECT
	            *,
	            to_jsonb(contracted_work)->'value' as contracted_work_data
	        FROM (
	            SELECT
	                *,
	                jsonb_object_keys(application.well_site #> '{contracted_work}') as contracted_work_type,
	                jsonb_each(application.well_site #> '{contracted_work}') as contracted_work
	            FROM (
	                SELECT 
	                    id,
	                    guid,
	                    application.json,
	                    t.well_site,
	                    t.idx-1 as well_index
	                FROM
	                    application,
	                    jsonb_array_elements(application.json -> 'well_sites') with ordinality as t(well_site, idx)
	            ) as application       
	        ) as application_well_site     
	    ) as application_well_site_contracted_work_data	    
	) as application_well_site_contracted_work

ORDER BY id, well_index, work_index ASC
	
LOOP
	UPDATE application
	SET json = jsonb_set(json, concat('{well_sites,', rec.well_index::int , ',contracted_work,', rec.contracted_work_type,'}')::text[], jsonb_set(json->'well_sites'->rec.well_index::int->'contracted_work'->rec.contracted_work_type, '{work_id}', CONCAT('"', rec.work_id::text, '"')::jsonb))
	WHERE guid = rec.guid;
END LOOP;

RETURN NULL;

END;

$BODY$ LANGUAGE plpgsql;


-- Manually update all of these affected applications using the new logic
BEGIN TRANSACTION;

DO $$
DECLARE 
    rec record;
BEGIN

FOR rec IN 

	SELECT
	    id,
	    guid,
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
	        *
	    FROM (
	        SELECT
	            *,
	            to_jsonb(contracted_work)->'value' as contracted_work_data
	        FROM (
	            SELECT
	                *,
	                jsonb_object_keys(application.well_site #> '{contracted_work}') as contracted_work_type,
	                jsonb_each(application.well_site #> '{contracted_work}') as contracted_work
	            FROM (
	                SELECT 
	                    id,
	                    guid,
	                    application.json,
	                    t.well_site,
	                    t.idx-1 as well_index
	                FROM
	                    application,
	                    jsonb_array_elements(application.json -> 'well_sites') with ordinality as t(well_site, idx)
					WHERE id IN (
						SELECT id
						FROM work_info_view wiv
						WHERE wiv.work_id IS NULL
					)
	            ) as application       
	        ) as application_well_site     
	    ) as application_well_site_contracted_work_data	    
	) as application_well_site_contracted_work

ORDER BY id, well_index, work_index ASC
	
LOOP
	UPDATE application
	SET json = jsonb_set(json, concat('{well_sites,', rec.well_index::int , ',contracted_work,', rec.contracted_work_type,'}')::text[], jsonb_set(json->'well_sites'->rec.well_index::int->'contracted_work'->rec.contracted_work_type, '{work_id}', CONCAT('"', rec.work_id::text, '"')::jsonb))
	WHERE guid = rec.guid;
END LOOP;

END;$$;

COMMIT TRANSACTION;
