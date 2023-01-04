#!/bin/bash

echo ********************************
echo *** Starting the Replica Set ***
echo ********************************

sleep 10 | echo Sleeping
mongo mongodb://mongo-1:27017 replicaSet.js
