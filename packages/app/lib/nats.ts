import { connect } from 'node-nats-streaming'
import log from './log'

const clusterID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const clientID = 'meditor-app'
const server = process.env.MEDITOR_NATS_SERVER || 'nats://meditor_nats:4222'

async function connectToNats() {
    log.info(
        `Connecting with client ${clientID} to NATS (Cluster: ${clusterID}, Server: ${server})`
    )

    if (!globalThis.natsClient) {
        globalThis.natsClient = connect(clusterID, clientID, {
            url: server,
            maxReconnectAttempts: -1,
        })
    }

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

export { connectToNats }
