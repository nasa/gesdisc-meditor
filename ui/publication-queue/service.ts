import natsClientPromise from '../lib/nats'
import type { QueueMessage } from './types'

export function publishMessageToQueueChannel(
    channelName: string,
    message: QueueMessage
) {
    // we'll return a promise to indicate whether the publish succeeded or not
    return new Promise<string>(async (resolve, reject) => {
        const natsClient = await natsClientPromise

        natsClient.publish(
            channelName,
            JSON.stringify(message),
            (err: Error | undefined, guid: string) => {
                if (err) {
                    console.error('Failed to publish queue message ', err)
                    reject(err)
                    return
                }

                console.log('Successfully published queue message ', guid)
                resolve(guid)
            }
        )
    })
}
