var MongoClient = require('mongodb').MongoClient;

var MongoUrl = process.env.MONGOURL;
var DbName = "meditor";
var ConnectorsQueueCollectionName = "queue-connectors";
var CONNECTORS_BASE_PATH = "./connectors";
var connectorRegistry = {
    'uui': CONNECTORS_BASE_PATH + '/uui'
};

var that = {};

function handleSuccess(meta, connectorMsg, res) {
    var procTime = {$set:{"x-meditor.processedOn":(new Date()).toISOString()}};
    console.log('Success! ', res, connectorMsg);
    return new Promise(function(resolve, reject) {
        meta.dbo.db(DbName).collection(ConnectorsQueueCollectionName).updateOne( {_id: connectorMsg._id}, procTime, function(err, res){
            if (err) {
                return reject(err, res);
            }
            resolve();
        });
    });
};

function handleError(meta, connectorMsg, err) {
    var procTime = {$set:{"x-meditor.failedOn":(new Date()).toISOString()}};
    console.error('Connector Queue Error', err, connectorMsg);
    return new Promise(function(resolve, reject) {
        meta.dbo.db(DbName).collection(ConnectorsQueueCollectionName).updateOne( {_id: connectorMsg._id}, procTime, function(err, res){
            if (err) {
                return reject(err, res);
            }
            resolve();
        });
    });
};

function handleMessage(meta, connectorMsg) {
    if (connectorMsg.target in connectorRegistry) {
        console.log('Sending connector', connectorMsg.data, 'message to', connectorMsg.target);
        return require(connectorRegistry[connectorMsg.target]).processQueueItem(connectorMsg.data)
            .then(function(res) {
                return handleSuccess(meta, connectorMsg, res);
            } , function(err) {
                return handleError(meta, connectorMsg, err);
            });
    } else {
        return handleError(dbo, connectorMsg, 'Unexpected format of connector message');
    }
};

MongoClient.connect(MongoUrl)
    .then(res => {
        that.dbo = res;
        return that.dbo
            .db(DbName)
            .collection(ConnectorsQueueCollectionName)
            .find({"x-meditor.processedOn": {$exists:false}})
            .toArray();
    })
    .then(res => {
        // Process messages one by one
        return res.reduce((promiseChain, message) => {
            return promiseChain.then(chainResults => 
                (handleMessage(that, message))
                    .then(currentResult => [ ...chainResults, currentResult ] )
            );
        }, Promise.resolve([]));
    })
    .then(res => {})
    .then(res => (that.dbo.close()))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      console.log(err.status || err.statusCode, err.message || 'Unknown error');
      return Promise.reject({status: err.status || err.statusCode, message: err.message || 'Unknown error'});
    });
