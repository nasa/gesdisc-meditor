var log = require('log')
require('log-node')()

var clusterID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
var clientID = 'publisher'
var server = process.env.MEDITOR_NATS_SERVER || 'nats://meditor_nats:4222'
var stan = require('node-nats-streaming').connect(clusterID, clientID, server)

log.notice(
    `Connecting with client ${clientID} to NATS (Cluster: ${clusterID}, Server: ${server})`
)

// close connection when API shuts down
process.on('SIGTERM', () => stan.close())

function subscribeToChannel(channel) {
    log.debug(`Subscribing to channel: ${channel}`)

    let options = stan.subscriptionOptions()
    options.setDeliverAllAvailable()
    options.setDurableName(`${clientID}-${channel}`)
    options.setManualAckMode(true)
    options.setAckWait(60 * 1000)

    return stan.subscribe(channel, options)
}

module.exports = {
    stan,
    subscribeToChannel,
}
