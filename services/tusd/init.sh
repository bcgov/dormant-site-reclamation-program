#!/bin/sh

# Populate gatekeeper environment variables
envsubst < gatekeeper.conf.tmpl > gatekeeper.conf

# Run keycloak-gatekeeper for authenticated reverse proxy
# keycloak-gatekeeper --config ./gatekeeper.conf

tusd  --hooks-dir /srv/tusd-hooks -s3-bucket=nrs.objectstore.gov.bc.ca/${AWS_BUCKET_ID}

# Bring any background processes to front to block container exit
wait