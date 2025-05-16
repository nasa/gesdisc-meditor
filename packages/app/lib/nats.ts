import { connect } from 'node-nats-streaming'
import type { DocumentMessage } from '../documents/types'
import type { EmailMessage } from '../email-notifications/types'
import { handlePublicationAcknowledgementFromNatsMessage } from '../publication-queue/service'
import {
    handleWebhookInvocationFromQueue,
    WEBHOOK_NATS_CHANNEL,
} from '../webhooks/service'
import type { QueueWebhookMessage } from '../webhooks/types'
import log from './log'

type QueueMessage = EmailMessage | DocumentMessage | QueueWebhookMessage

const NATS_QUEUE_PREFIX = 'meditor-'

const clusterID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const clientID = 'meditor-app'
const server = process.env.MEDITOR_NATS_SERVER || 'nats://meditor_nats:4222'

async function connectToNats() {
    log.info(
        `Connecting with client ${clientID} to NATS (Cluster: ${clusterID}, Server: ${server})`
    )

    if (globalThis.natsClient) {
        log.debug(`A global NATS client was found; returning early.`)

        return
    }

    log.debug(
        `A global NATS client was not found; attempting to connect ${clientID} to ${clusterID}.`
    )

    globalThis.natsClient = connect(clusterID, clientID, {
        url: server,
        maxReconnectAttempts: -1,
    })

    // close connection when API shuts down
    process.on('SIGTERM', event => {
        log.error(
            `Closing STAN connection because of ${JSON.stringify(
                event,
                undefined,
                2
            )}`
        )

        globalThis.natsClient.close()
    })

    globalThis.natsClient.on('connect', () => {
        log.info(
            `onConnect: Connected client ${clientID} to NATS Streaming Server cluster ${clusterID} at ${server}.`
        )

        // subscribe to publication acknowledgements
        subscribeToChannel('meditor-Acknowledge').on(
            'message',
            handlePublicationAcknowledgementFromNatsMessage
        )

        // Subscribe to webhook messages, invoking the webhook.
        // Only acknowledges successes so that failed / timed-out webhooks get retried per our NATS config.
        subscribeToChannel(`${NATS_QUEUE_PREFIX}${WEBHOOK_NATS_CHANNEL}`).on(
            'message',
            handleWebhookInvocationFromQueue
        )

        return Promise.resolve()
    })

    globalThis.natsClient.on('error', (error: any) => {
        log.error(`onError (connection): ${error}.`)

        //! This is assumed to be an operational error that needs a NATS restart.
        globalThis.natsClient.close()
    })

    globalThis.natsClient.on('close', (error?: string) => {
        if (error) {
            log.error(`onClose: ${error}.`)
        }

        log.warn(
            `onClose: Disconnected client ${clientID} from NATS Streaming Server cluster ${clusterID} at ${server}.`
        )
    })
}

function subscribeToChannel(channel: string) {
    log.debug(`Subscribing to channel: ${channel}`)

    let options = globalThis.natsClient.subscriptionOptions()
    options.setDeliverAllAvailable()
    options.setDurableName(`${clientID}-${channel}`)
    options.setManualAckMode(true)
    options.setAckWait(60 * 1000)

    return globalThis.natsClient.subscribe(channel, options)
}

async function publishMessageToQueueChannel(
    channelName: string,
    message: QueueMessage
) {
    await connectToNats()

    // we'll return a promise to indicate whether the publish succeeded or not
    return new Promise<string>((resolve, reject) => {
        const fullChannelName = !channelName.startsWith(NATS_QUEUE_PREFIX)
            ? NATS_QUEUE_PREFIX + channelName
            : channelName // ensure the channel name follows the "meditor-NAME" pattern

        log.info(`Publishing message to channel ${fullChannelName}`)
        log.debug(message)

        globalThis.natsClient.publish(
            fullChannelName,
            JSON.stringify(message),
            (err: Error | undefined, guid: string) => {
                if (err) {
                    log.error('Failed to publish queue message ', err)
                    reject(err)
                    return
                }

                log.info('Successfully published queue message ', guid)
                resolve(guid)
            }
        )
    })
}

export { connectToNats, publishMessageToQueueChannel }
