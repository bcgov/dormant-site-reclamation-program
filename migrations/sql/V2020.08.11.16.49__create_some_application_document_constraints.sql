ALTER TABLE application_document ALTER COLUMN application_document_code SET NOT NULL;

ALTER TABLE application_document ADD PRIMARY KEY (application_document_guid);
