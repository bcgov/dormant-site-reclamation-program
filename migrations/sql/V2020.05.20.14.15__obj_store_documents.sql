ALTER TABLE application_document ADD COLUMN object_store_path varchar; 
ALTER TABLE application_document ALTER COLUMN document_manager_guid DROP NOT NULL;