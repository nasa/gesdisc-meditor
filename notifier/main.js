import log from 'log'
import nats from 'node-nats-streaming'
import { sendMail } from './lib/mail'
require('log-node')()

const CLUSTER_ID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const CLIENT_ID = process.env.MEDITOR_NATS_CLIENT_ID || 'meditor_notifier'
const SERVER = process.env.MEDITOR_NATS_SERVER || 'nats://nats:4222'
const CHANNEL_NAME = process.env.MEDITOR_NATS_NOTIFICATIONS_CHANNEL || 'meditor-notifications'

log.notice(`Attempting to connect client (${CLIENT_ID}) to NATS (Cluster: ${CLUSTER_ID}, Server: ${SERVER})`)

const stan = nats.connect(CLUSTER_ID, CLIENT_ID, SERVER)

stan.on('connect', () => {
    log.notice('Connected to NATS successfully')

    const subscription = getDurableSubscriptionToChannel(CHANNEL_NAME)
    subscription.on('message', handleMessage)
})

// gracefully handle shutdown by closing connection to NATS server
process.on('SIGTERM', () => {
    log.notice('SIGTERM received, closing NATS connection and shutting down')
    stan.close()
})

/**
 * handle message received from the subscribed NATS channel
 * @param {*} message 
 */
async function handleMessage(message) {
    log.debug('Message received, processing now ', message.getData())

    const parsedMessage = JSON.parse(message.getData())

    try {
        await sendMail(
            parsedMessage.subject, 
            parsedMessage.body,
            `${parsedMessage.body}<p>See <a href="${parsedMessage.link.url}">${parsedMessage.link.label}</a> for more details.</p>`,
            parsedMessage.to.join(),
            parsedMessage.cc.join(),
        )
        
        log.debug('Successfully processed message, sending acknowledgement to NATS')
        
        message.ack()
    } catch (err) {
        console.error('Failed to process message', err)
    }
}

/**
 * A durable subscription means that NATS can keep track of which messages a client received
 * in the event of client downtime.
 * @param {string} channel 
 */
function getDurableSubscriptionToChannel(channel) {
    let options = stan.subscriptionOptions()
    options.setDeliverAllAvailable()
    options.setDurableName(`${CLIENT_ID}-${CHANNEL_NAME}`) // to be durable, this name should be unique to the client

    // only include these if you want to manual acknowledge you received a message!
    // NATS will keep resending messages until you acknowledge you got it
    options.setManualAckMode(true)
    options.setAckWait(60 * 1000)

    return stan.subscribe(channel, options)
}
