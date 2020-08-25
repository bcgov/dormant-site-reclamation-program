CREATE TABLE IF NOT EXISTS application_document_type (
	application_document_code varchar PRIMARY KEY,
	description varchar NOT NULL,
	long_description varchar,
	active bool NOT NULL DEFAULT true,
	create_user varchar NOT NULL,
	create_timestamp timestamp NOT NULL DEFAULT now(),
	update_user varchar NOT NULL,
	update_timestamp timestamp NOT NULL DEFAULT now()
);

ALTER TABLE application_document_type OWNER TO dsrp;

INSERT INTO application_document_type (
    application_document_code,
    description,
	long_description,
    create_user,
    update_user
    )
VALUES
    ('SUPPORTING_DOC', 'Supporting Document', 'A document that the applicant uploads to support the assessment of their application.', 'system', 'system'),
    ('INTERIM_EOC', 'Evidence of Cost (Interim Payment)', 'An interim-payment Evidence of Cost document that is required to process interim payments.', 'system', 'system'),
    ('FINAL_EOC', 'Evidence of Cost (Final Payment)', 'A final-payment Evidence of Cost document that is required to process final payments.', 'system', 'system'),
    ('FINAL_REPORT', 'Final Report', 'A Final Report document that is required to process final payments for a contracted work item.', 'system', 'system')
ON CONFLICT DO NOTHING;


ALTER TABLE application_document
ADD COLUMN IF NOT EXISTS application_document_code varchar;

ALTER TABLE application_document DROP CONSTRAINT IF EXISTS application_document_application_document_code_fkey;

ALTER TABLE application_document 
ADD CONSTRAINT application_document_application_document_code_fkey
FOREIGN KEY (application_document_code)
REFERENCES application_document_type(application_document_code)
DEFERRABLE INITIALLY DEFERRED;

UPDATE application_document
SET application_document_code = 'SUPPORTING_DOC'
WHERE application_document_code IS NULL;
