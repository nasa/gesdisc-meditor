#!/usr/bin/env sh
set -eu

envsubst '${SERVER_HOST} ${UI_HOST} ${MONITOR_HOST}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"
