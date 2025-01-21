import log from '../lib/log'
import { connectToNats, getDb } from '../lib/connections'
import { ObjectId } from 'mongodb'
import type { PublicationAcknowledgement, QueueMessage } from './types'

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
export async function handlePublicationAcknowledgementFromNatsMessage(message) {
    try {
        // parse the message
        const acknowledgement: PublicationAcknowledgement = JSON.parse(
            message.getData()
        )

        handlePublicationAcknowledgement(acknowledgement)
    } catch (err) {
        // the subscriber sent us a message that wasn't JSON parseable
        log.error(
            'Failed to parse the following publication acknowledgement from NATS:'
        )
        log.error(message.getData())
    } finally {
        // acknowledge so that NATS won't try to resend
        message.ack()
    }
}

export async function handlePublicationAcknowledgement(
    acknowledgement: PublicationAcknowledgement
) {
    log.debug('Acknowledgement received, processing now ', acknowledgement)

    const db = await getDb()

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
        await db.collection(acknowledgement.model).updateOne(
            {
                _id: new ObjectId(acknowledgement.id),
            },
            {
                $pull: {
                    'x-meditor.publishedTo': {
                        target: acknowledgement.target,
                        // if document is in "Published" state, this would clear out any publication statuses for **other** states
                        // i.e. any publication statuses that are marked as "Draft" would be cleared out
                        state: { $ne: acknowledgement.state },
                    },
                },
            }
        )

        // update document state to reflect publication status
        await db.collection(acknowledgement.model).updateOne(
            {
                _id: new ObjectId(acknowledgement.id),
            },
            {
                $addToSet: {
                    'x-meditor.publishedTo': publicationStatus,
                },
            }
        )

        log.debug(
            'Successfully updated document with publication status ',
            publicationStatus
        )
    } catch (err) {
        // whoops, the message must be improperly formatted, throw an error
        console.error('Failed to process message', err)
    }
}
