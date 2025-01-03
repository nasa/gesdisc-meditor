import log from './log'
import { connect } from 'node-nats-streaming'
import { handlePublicationAcknowledgements } from '../publication-queue/service'

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
            handlePublicationAcknowledgements
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

function subscribeToChannel(channel) {
    log.debug(`Subscribing to channel: ${channel}`)

    let options = globalThis.natsClient.subscriptionOptions()
    options.setDeliverAllAvailable()
    options.setDurableName(`${clientID}-${channel}`)
    options.setManualAckMode(true)
    options.setAckWait(60 * 1000)

    return globalThis.natsClient.subscribe(channel, options)
}

export { connectToNats }
