ARG REGISTRY
FROM ${REGISTRY}nginx:1.14.0-alpine

COPY nginx.conf /etc/nginx/nginx.conf

CMD /docker-entrypoint.sh
EXPOSE 8080
