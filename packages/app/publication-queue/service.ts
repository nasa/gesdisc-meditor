import log from '../lib/log'
import { connectToNats } from '../lib/connections'
import { DocumentRepository } from '../documents/repository'
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

/**
 * handles success/failure messages received from the NATS acknowledgements queue
 * @param {*} message
 */
export async function handlePublicationAcknowledgements(message) {
    let acknowledgement

    try {
        acknowledgement = escape(JSON.parse(message.getData()))
    } catch (err) {
        // the subscriber sent us a message that wasn't JSON parseable
        log.error('Failed to parse the following publication acknowledgement:')
        log.error(message.getData())

        message.ack() // acknowledge the message so NATS doesn't keep trying to send it
        return
    }

    log.debug('Acknowledgement received, processing now ', acknowledgement)

    const documentRepository = new DocumentRepository(acknowledgement.model)

    try {
        const publicationStatus = {
            ...(acknowledgement.url && { url: acknowledgement.url }),
            ...(acknowledgement.redirectToUrl && {
                redirectToUrl: acknowledgement.redirectToUrl,
            }),
            ...(acknowledgement.message && { message: acknowledgement.message }),
            ...(acknowledgement.target && { target: acknowledgement.target }),
            ...(acknowledgement.statusCode && {
                statusCode: acknowledgement.statusCode,
            }),
            ...(acknowledgement.statusCode && {
                [acknowledgement.statusCode == 200 ? 'publishedOn' : 'failedOn']:
                    Date.now(),
            }),
            ...(acknowledgement.state && { state: acknowledgement.state }),
        }

        // remove any existing publication statuses for this target (for example: past failures)
        await documentRepository.updateOneById(acknowledgement.id, {
            $pull: {
                'x-meditor.publishedTo': {
                    target: acknowledgement.target,
                    // if document is in "Published" state, this would clear out any publication statuses for **other** states
                    // i.e. any publication statuses that are marked as "Draft" would be cleared out
                    state: { $ne: acknowledgement.state },
                },
            },
        })

        // update document state to reflect publication status
        // TODO: can we do both this and the above update at once?
        await documentRepository.updateOneById(acknowledgement.id, {
            $addToSet: {
                'x-meditor.publishedTo': publicationStatus,
            },
        })

        log.debug(
            'Successfully updated document with publication status ',
            publicationStatus
        )
    } catch (err) {
        // whoops, the message must be improperly formatted, throw an error
        console.error('Failed to process message', err)
    } finally {
        // acknowledge so that NATS won't try to resend
        message.ack()
    }
}
