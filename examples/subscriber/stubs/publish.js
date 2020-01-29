const nats = require('node-nats-streaming')

const CLIENT_ID = 'stub-publisher'
const CLUSTER_ID = process.env.MEDITOR_NATS_CLUSTER_ID || 'test-cluster'
const SERVER = process.env.MEDITOR_NATS_SERVER || 'nats://localhost:4222'

const stan = nats.connect(CLUSTER_ID, CLIENT_ID, SERVER)

stan.on('connect', () => {
    console.log('connected to NATS, publishing to channel: meditor-FAQs')

    const message = {
        "document": {
            "model": "FAQs",
            "title": "Why was the cat afraid of the tree?",
            "body": "Because of it's bark!",
            "version": "2020-01-21T18:14:02.671Z",
            "state": "Under Review"
        },
        "state": "Under Review",
        "time": 1580324162703
    }

    stan.publish('meditor-FAQs', JSON.stringify(message), () => {
        console.log('Successfully sent the message!')
        process.exit(0)
    })
})
