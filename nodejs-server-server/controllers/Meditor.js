'use strict'

var log = require('log')
var mongo = require('mongodb')
var MongoClient = mongo.MongoClient
var ObjectID = mongo.ObjectID
var nats = require('./lib/nats-connection')
var escape = require('mongo-escape').escape

var MongoUrl = process.env.MONGOURL || 'mongodb://meditor_database:27017/'
var DbName = 'meditor'


// subscribe to publication acknowledgements
nats.subscribeToChannel('meditor-Acknowledge').on(
    'message',
    handlePublicationAcknowledgements
)

/**
 * handles success/failure messages received from the NATS acknowledgements queue
 * @param {*} message
 */
async function handlePublicationAcknowledgements(message) {
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

    let client = new MongoClient(MongoUrl)

    await client.connect()

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
        }

        const db = client.db(DbName).collection(acknowledgement.model)

        // remove any existing publication statuses for this target (for example: past failures)
        await db.updateOne(
            {
                _id: ObjectID(acknowledgement.id),
            },
            {
                $pull: {
                    'x-meditor.publishedTo': {
                        target: acknowledgement.target,
                    },
                },
            }
        )

        // update document state to reflect publication status
        await db.updateOne(
            {
                _id: ObjectID(acknowledgement.id),
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

        message.ack()
    } catch (err) {
        // whoops, the message must be improperly formatted, throw an error and acknowledge so that NATS won't try to resend
        console.error('Failed to process message', err)
        message.ack()
    } finally {
        await client.close()
    }
}
