#!/bin/sh

if [[ -z "$CHANGE_ID" ]]
then 
    tusd -base-path="/files/" -behind-proxy -s3-endpoint=${S3_ENDPOINT} -s3-bucket=${S3_BUCKET_ID} -s3-object-prefix=${S3_PREFIX} -verbose
else
    tusd -base-path="/${CHANGE_ID}/files/" -behind-proxy -s3-endpoint=${S3_ENDPOINT} -s3-bucket=${S3_BUCKET_ID} -s3-object-prefix=${S3_PREFIX} -verbose
fi