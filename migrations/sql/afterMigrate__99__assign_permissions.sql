/**
Allow DSRP user to CRUD anything on the dsrp schema
**/
GRANT ALL PRIVILEGES ON DATABASE dsrp TO dsrp;
GRANT ALL PRIVILEGES ON SCHEMA public TO dsrp;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dsrp;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dsrp;

/**
Allow metabase user to READ anything on the dsrp schema
**/
GRANT USAGE ON SCHEMA public TO metabase;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO metabase;