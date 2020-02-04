import log from 'log'
import nats from 'node-nats-streaming'
const _ = require('lodash')

require('log-node')()
const uuiConfig = require('./uui-publisher-config');
const uuiPublisher = require('./uui-publisher');

const CLIENT_ID = 'uui_meditor_subscriber'          // change this to uniquely identify the subscriber
const CHANNEL_PREFIX = 'meditor-'
const SUBSCRIBED_CHANNELS = uuiConfig.PUBLISHABLE_MODELS.map(model => CHANNEL_PREFIX + model) // one or more channels to subscribe to

// connection info
const CLUSTER_ID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const SERVER = process.env.MEDITOR_NATS_SERVER || 'nats://localhost:4222'

const MAX_PUBLISH_RETIRES = 3

log.notice(`Attempting to connect client (${CLIENT_ID}) to NATS (Cluster: ${CLUSTER_ID}, Server: ${SERVER})`)

const stan = nats.connect(CLUSTER_ID, CLIENT_ID, SERVER)
var publishRetries = 0

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

    options.setManualAckMode(true)
    options.setAckWait(60 * 1000)   // tell NATS to wait a minute before resending

    return stan.subscribe(channel, options)
}

// Publish acknowledgement back to Meditor
function acknowledge(message, response) {
  // Prepare a response using bits and pieces of original message and uui response
  message = _.pick(message, ['id', 'target', 'state', 'model']);
  response =  _.pick(response, ['url', 'statusCode', 'message', 'time']);
  response = _.assign(response, message);
  log.notice('Acknowledging: ', response);
  stan.publish('meditor-Acknowledge', JSON.stringify(message), () => {
    log.notice('Successfully published acknowledgement')
  })
}

/**
 * handle message received from the subscribed NATS channel
 * @param {*} message 
 */
function handleMessage(message) {
  // {
  //     "id": "",
  //     "document": {...},
  //     "model": {...},
  //     "target": "uui",            # (optional) if included, this message is only meant for a certain subscriber
  //     "state": "Under Review",
  //     "time": 1580324162703
  // }

  // The clients are expected to publish an acknowledgement message into the 'meditor-Acknowledgement' queue:

  // {
  //     "time": 1580324162703,
  //     "id": "Example article",
  //     "model": "News",
  //     "target": "uui",
  //     "url": "https://disc.gsfc.nasa.gov/information/news?title=Example%20article",
  //     "message": ,
  //     "statusCode": "200",
  //     "state": "Under Review"
  // }
  log.debug('Message in [' + message.getSubject() + '] received, processing now')
  try {
      const parsedMessage = JSON.parse(JSON.parse(message.getData()))
      const modelName = message.getSubject().replace(CHANNEL_PREFIX, '')
      const model = parsedMessage.model
      const document = parsedMessage.document
      const documentState = parsedMessage.state
      parsedMessage.model = modelName // Fudge model attribute for the acknowledgement
      // Acknowledge only if we got something back from UUI
      uuiPublisher.processMessage(modelName, model, document, documentState)
        .then(function(res) {
          message.ack()
          acknowledge(parsedMessage, res)
        })
        .catch(function(err) {
          if (!!err.message && err.message.toLowerCase().indexOf('connection')) {
            publishRetries++;
            // Don't acknowledge so we can try again. Should we post error to the ack queue?
            if (publishRetries < MAX_PUBLISH_RETIRES) {
              log.warn('Failed to connect to UUI. Going to try again in a minute (try # ' + publishRetries + ').', err)
              return;
            }
          }
          publishRetries = 0
          message.ack()
          acknowledge(parsedMessage, err)
        })
  } catch (err) {
    log.error('Failed to process message', err)
    message.ack()
    acknowledge(parsedMessage, {
      message: 'Failed to parse subscription queue message',
      statusCode: 400
    })
  }
}
