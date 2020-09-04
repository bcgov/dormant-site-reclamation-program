CREATE INDEX ON application USING BTREE ((json->'company_details'->'company_name'->>'label'));
