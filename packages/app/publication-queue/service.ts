import log from '../lib/log'
import { connectToNats } from '../lib/nats'
import type { QueueMessage } from './types'

const NATS_QUEUE_PREFIX = 'meditor-'

export async function publishMessageToQueueChannel(
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
