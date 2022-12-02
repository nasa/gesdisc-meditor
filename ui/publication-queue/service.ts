import natsClientPromise from '../lib/nats'
import type { QueueMessage } from './types'

const NATS_QUEUE_PREFIX = 'meditor-'

export function publishMessageToQueueChannel(
    channelName: string,
    message: QueueMessage
) {
    // we'll return a promise to indicate whether the publish succeeded or not
    return new Promise<string>(async (resolve, reject) => {
        const natsClient = await natsClientPromise
        const fullChannelName = !channelName.startsWith(NATS_QUEUE_PREFIX)
            ? NATS_QUEUE_PREFIX + channelName
            : channelName // ensure the channel name follows the "meditor-NAME" pattern

        console.log(`Publishing message to channel ${fullChannelName}`)
        console.debug(message)

        natsClient.publish(
            fullChannelName,
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
