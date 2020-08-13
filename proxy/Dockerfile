FROM registry1.gesdisc.eosdis.nasa.gov/certified/nginx:1.14.0-alpine

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /

CMD /docker-entrypoint.sh
EXPOSE 8080
