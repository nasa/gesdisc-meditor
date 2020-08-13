#!/usr/bin/env sh
set -eu

if [[ -n "${SERVER_HOST}" ]]; then
    envsubst '${SERVER_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf.template
fi

if [[ -n "${UI_HOST}" ]]; then
    envsubst '${UI_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf.template
fi

if [[ -n "${NATS_HOST}" ]]; then
    envsubst '${NATS_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf.template
fi

if [[ -n "${MONITOR_HOST}" ]]; then
    envsubst '${MONITOR_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf.template
fi

cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf
nginx -g daemon off;
