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
