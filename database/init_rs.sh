#!/bin/bash
set -x
MONGO="/usr/bin/mongo"
MONGOD="/usr/bin/mongod"

checkSecondaryStatus(){
    SECONDARY=$1
    PORT=$2
    $MONGO --host $SECONDARY --port $PORT --eval db
    while [ "$?" -ne 0 ]
    do
        echo "Waiting for secondary to come up..."
        sleep 15
        $MONGO --host $SECONDARY --port $PORT --eval db
    done
}

if [ "$MONGOROLE" == "primary" ]
then
    checkSecondaryStatus "meditor_database_sec_1" "27017"
    checkSecondaryStatus "meditor_database_sec_2" "27017"
    echo "******************************* Setup replicaset"
    # $MONGO --eval "rs.initiate()"
    # $MONGO --eval "rs.add(\"meditor_database_sec_1:27017\")"
    # $MONGO --eval "rs.add(\"meditor_database_sec_2:27017\")"
fi
tail -f /dev/null
