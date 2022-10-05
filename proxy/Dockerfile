ARG REGISTRY
FROM ${REGISTRY}nginx:1.23.1-alpine

WORKDIR /

COPY . .
COPY ./proxy.conf /etc/nginx/proxy.conf
COPY ./apiAdapter.js /etc/nginx/apiAdapter.js

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 8080
