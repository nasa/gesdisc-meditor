#!/usr/bin/env sh
set -eu

UI_HOST="${UI_HOST:-meditor_app}" \
DOCS_HOST="${DOCS_HOST:-meditor_docs}" \
MONITOR_HOST="${MONITOR_HOST:-meditor_monitor}" \
NOTEBOOKVIEWER_HOST="${NOTEBOOKVIEWER_HOST:-meditor_notebookviewer}" \
envsubst '${UI_HOST} ${DOCS_HOST} ${MONITOR_HOST} ${NOTEBOOKVIEWER_HOST}' < /nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"
