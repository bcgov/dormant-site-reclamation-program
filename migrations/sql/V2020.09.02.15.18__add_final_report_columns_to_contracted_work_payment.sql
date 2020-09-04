ALTER TABLE contracted_work_payment

ADD COLUMN IF NOT EXISTS surface_landowner varchar,
ADD COLUMN IF NOT EXISTS reclamation_was_achieved boolean,

ADD COLUMN IF NOT EXISTS abandonment_cut_and_capped_completed boolean,
ADD COLUMN IF NOT EXISTS abandonment_notice_of_operations_submitted boolean,
ADD COLUMN IF NOT EXISTS abandonment_was_pipeline_abandoned boolean,
ADD COLUMN IF NOT EXISTS abandonment_metres_of_pipeline_abandoned integer,

ADD COLUMN IF NOT EXISTS site_investigation_type_of_document_submitted varchar,
ADD COLUMN IF NOT EXISTS site_investigation_concerns_identified boolean,

ADD COLUMN IF NOT EXISTS remediation_identified_contamination_meets_standards boolean,
ADD COLUMN IF NOT EXISTS remediation_type_of_document_submitted varchar,
ADD COLUMN IF NOT EXISTS remediation_reclaimed_to_meet_cor_p1_requirements boolean,

ADD COLUMN IF NOT EXISTS reclamation_reclaimed_to_meet_cor_p2_requirements boolean,
ADD COLUMN IF NOT EXISTS reclamation_surface_reclamation_criteria_met boolean;
