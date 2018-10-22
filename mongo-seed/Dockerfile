FROM dev.gesdisc.eosdis.nasa.gov:443/mongo/4.1.4

COPY backup /tmp/backup

CMD mongorestore /tmp/backup --quiet --host meditor_database:27017 -d meditor
