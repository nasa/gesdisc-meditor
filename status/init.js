const mongoose = require('mongoose')
const art = require('ascii-art')
const fs = require('fs')
const getContent = require('./get-content').getContent

art.Figlet.fontPath = './'

const MAX_MINUTES_TO_CONNECT = 2
const MILLIS_BETWEEN_ATTEMPTS = 500
const MAX_ATTEMPTS = MAX_MINUTES_TO_CONNECT * 60 * 1000 / MILLIS_BETWEEN_ATTEMPTS

console.time('Startup time')

function delay(delayMillis) {
    return new Promise(resolve => setTimeout(resolve, delayMillis))
}

async function waitForUi(attempt = 1) {
    console.log('on attempt: ', attempt, ' url: ', process.env.APP_UI_URL)

    if (attempt >= MAX_ATTEMPTS) throw new Error('UI did not startup in time!')

    try {
        await getContent(process.env.APP_UI_URL)
    } catch (err) {
        console.error(err)
        await delay(MILLIS_BETWEEN_ATTEMPTS)
        return await waitForUi(++attempt)
    }
}

async function waitForMongoReplicaset() {
    return Promise.resolve()
}

async function waitForApi() {
    return Promise.resolve()
}

async function waitForNotifier() {
    return Promise.resolve()
}

async function init() {
    try {
        await Promise.all([
            waitForUi(),
            waitForApi(),
            waitForMongoReplicaset(),
            waitForNotifier(),
        ])

        art.font('Meditor', 'big', rendered => {
            console.log('********************\n\n\n\n')
            console.log(`${rendered}\n\n`)
            console.log(`UI: ${process.env.APP_UI_URL}`)
            console.log(`API: ${process.env.APP_URL}\n\n`)
            console.timeEnd('Startup time')
        })
    } catch (err) {
        console.error('Meditor failed to startup')
        console.error(err)
    }
}

init()

/*
const MONGO_URL = "mongodb://meditor_database:27017"
const RECONNECT_TIMEOUT_MILLIS = 2000
const MAX_RECONNECT_ATTEMPTS = 5

async function connectToMongoDb(attempt = 1) {
    console.log(`attempting to connect to mongo (attempt #${attempt}): ${MONGO_URL} `)
    try {
        return await mongoose.connect(MONGO_URL)
    } catch (err) {
        if (attempt >= MAX_RECONNECT_ATTEMPTS) throw err

        console.log('waiting for mongo to startup...')
        setTimeout(() => connectToMongoDb(++attempt), RECONNECT_TIMEOUT_MILLIS)
    }
}

async function getReplicaSetFromDb(db) {
    try {
        let adminDb = db.useDb('admin')
        let info = await adminDb.command({ replSetGetStatus: 1 })
        console.log(`Replica set ${info.set} is running`)
        return info
    } catch (err) {
        console.log('Replica set is not running')
        return null
    }
}

async function initializeReplicaSetInDb(db) {
    try {
        let adminDb = db.useDb('admin')
        let info = await adminDb.command({ replSetInitiate: replicaSetConfig })
        console.log(info)
    } catch (err) {
        console.log(err)
    }
}

async function init() {
    try {
        let db = await connectToMongoDb()
        let rs = await getReplicaSetFromDb(db)

        if (!rs) {
            await initializeReplicaSetInDb(db)
        }

        db.close()
    } catch (err) {
        console.log(err)
    }
}

init()
*/