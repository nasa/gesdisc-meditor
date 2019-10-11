#!/usr/bin/env sh
set -eu

envsubst '${SERVER_HOST} ${UI_HOST} ${MONITOR_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"
