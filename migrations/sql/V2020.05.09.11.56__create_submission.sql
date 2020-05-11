CREATE TABLE IF NOT EXISTS submission(
    submission_id	          serial                                  NOT NULL PRIMARY KEY,
    messagebody               varchar                                 NOT NULL            
);
ALTER TABLE party_orgbook_entity OWNER TO dsrp;