import { connect } from 'node-nats-streaming'
import type { Stan } from 'node-nats-streaming'
import log from './log'

const clusterID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const clientID = 'meditor-app'
const server = process.env.MEDITOR_NATS_SERVER || 'nats://meditor_nats:4222'

let natsClient: Stan
let natsClientPromise: Promise<Stan>

function connectToNats() {
    log.info(
        `Connecting with client ${clientID} to NATS (Cluster: ${clusterID}, Server: ${server})`
    )

    const stan = connect(clusterID, clientID, {
        url: server,
    })

    // close connection when API shuts down
    process?.on('SIGTERM', closeNatsConnection)

    return {
        stan,
        // also returning a promise that resolves when NATS connects
        stanConnectPromise: new Promise<Stan>(resolve => {
            // wait for the connection to complete
            stan.on('connect', () => {
                log.info('Connected to NATS')
                resolve(stan)
            })

            stan.on('error', (error: any) => {
                log.error(error) //? do anything beyond logging?
            })
        }),
    }
}

function closeNatsConnection() {
    natsClient?.close()
}

if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    if (!globalThis._natsClientPromise) {
        const { stan, stanConnectPromise } = connectToNats()

        natsClient = stan
        // @ts-ignore in development
        global._natsClientPromise = stanConnectPromise
    }

    // @ts-ignore in development
    natsClientPromise = global._natsClientPromise
} else {
    const { stan, stanConnectPromise } = connectToNats()

    natsClient = stan
    natsClientPromise = stanConnectPromise
}

export { natsClientPromise as default }
