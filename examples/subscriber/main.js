import log from 'log'
import nats from 'node-nats-streaming'
require('log-node')()

const CLIENT_ID = 'meditor_example_subscriber'      // change this to uniquely identify the subscriber
const SUBSCRIBED_CHANNELS = ['meditor-Example-News']    // one or more channels to subscribe to
const TARGET = "example"                        // some short identifier to describe where the document went (ex. "cmr")

// By default, NATS auto acknowledges on delivery. Set this to true to manually acknowledge instead.
// NATS will keep resending a message until you acknowledge you received it
// An example would be: making sure an email was sent out before acknowledging
const USE_MANUAL_ACKNOWLEDGEMENTS = false

// connection info
const CLUSTER_ID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const SERVER = process.env.MEDITOR_NATS_SERVER || 'nats://meditor_nats:4222'

log.notice(`Attempting to connect client (${CLIENT_ID}) to NATS (Cluster: ${CLUSTER_ID}, Server: ${SERVER})`)

const stan = nats.connect(CLUSTER_ID, CLIENT_ID, SERVER)

// connect to NATS
stan.on('connect', () => {
    log.notice('Connected to NATS successfully')

    // add a subscriber for each channel
    SUBSCRIBED_CHANNELS.forEach((channel) => {
        const subscription = getDurableSubscriptionToChannel(channel)
        subscription.on('message', handleMessage)
    })
})

// gracefully handle shutdown by closing connection to NATS server
process.on('SIGTERM', () => {
    log.notice('SIGTERM received, closing NATS connection and shutting down')
    stan.close()
})

/**
 * A durable subscription means that NATS can keep track of which messages a client received
 * in the event of client downtime.
 * @param {string} channel 
 */
function getDurableSubscriptionToChannel(channel) {
    let options = stan.subscriptionOptions()
    options.setDeliverAllAvailable()
    options.setDurableName(`${CLIENT_ID}-${channel}`) // to be durable, this name should be unique to the client

    if (USE_MANUAL_ACKNOWLEDGEMENTS) {
        options.setManualAckMode(true)
        options.setAckWait(60 * 1000)   // tell NATS to wait a minute before resending
    }

    return stan.subscribe(channel, options)
}

/**
 * handle message received from the subscribed NATS channel
 * @param {*} message 
 */
function handleMessage(message) {
    const parsedMessage = JSON.parse(message.getData())

    log.debug('Message received, processing now ', parsedMessage)

    try {
        //
        // Do something with the message here!
        // For example: push a News item to an external API or publish a collection to CMR
        //

        // now you can send a success or failure acknowledgement back to mEditor
        let exampleAcknowledgement = {
            "time": Date.now().getTime(),
            "id": message.id,
            "model": message.model,
            "target": TARGET,
            "url": "https://example-website.nasa.gov/news?title=Example%20news%20article",
            "message": "Successfully published news article",
            "statusCode": "200",
        }

        log.notice('Acknowledging: ', exampleAcknowledgement);

        if (USE_MANUAL_ACKNOWLEDGEMENTS) {
            message.ack()
        }

        stan.publish('meditor-Acknowledge', JSON.stringify(exampleAcknowledgement), () => {
            log.notice('Successfully published acknowledgement');
        });
    } catch (err) {
        console.error('Failed to process message', err)
    }
}
