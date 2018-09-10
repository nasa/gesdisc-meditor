FROM mongo:4.1

COPY backup /tmp/backup

CMD mongorestore /tmp/backup --quiet --host meditor_database:27017 -d meditor
