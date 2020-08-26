ARG REGISTRY
FROM ${REGISTRY}nginx:1.14.0-alpine

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /

CMD /docker-entrypoint.sh
EXPOSE 8080
