// NATS clusterID, clientID, server
var clusterID = 'test-cluster';
var clientID = 'publisher';
var server = 'nats://nats:4222';
var stan = require('node-nats-streaming').connect(clusterID, clientID, server);
module.exports.stan = stan;
