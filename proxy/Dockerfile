ARG REGISTRY
FROM ${REGISTRY}nginx:1.21.6-alpine

WORKDIR /

COPY . .

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 8080