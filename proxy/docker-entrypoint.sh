#!/usr/bin/env sh
set -eu

#SERVER_HOST="${SERVER_HOST:-meditor_server}" \
#UI_HOST="${UI_HOST:-meditor_ui}" \
#NATS_HOST="${NATS_HOST:-meditor_nats}" \
#MONITOR_HOST="${MONITOR_HOST:-meditor_monitor}" \
#envsubst '${SERVER_HOST} ${UI_HOST} ${NATS_HOST} ${MONITOR_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf;

nginx -g 'daemon off;';
