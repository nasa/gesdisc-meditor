const mongoose = require('mongoose')
const replicaSetConfig = require('./rs-config')

const MONGO_URL = "mongodb://meditor_database:27017"
const RECONNECT_TIMEOUT_MILLIS = 2000
const MAX_RECONNECT_ATTEMPTS = 5

async function connectToMongoDb(attempt = 1) {
    console.log(`attempting to connect to mongo (attempt #${attempt}): ${MONGO_URL} `)

    try {
        await mongoose.connect(MONGO_URL)
        return await mongoose.connection.useDb('meditor')
    } catch (err) {
        if (attempt >= MAX_RECONNECT_ATTEMPTS) throw err

        console.log('waiting for mongo to startup...')

        setTimeout(() => connectToMongoDb(++attempt), RECONNECT_TIMEOUT_MILLIS)
    }
}

async function getReplicaSetFromDb() {
    try {
        let info = await mongoose.connection.db.admin().command({ replSetGetStatus: 1 })
        console.log(`Replica set ${info.set} is running`)
        return info
    } catch (err) {
        console.log('Replica set is not running')
        return null
    }
}

async function initializeReplicaSetInDb() {
    try {
        let info = await mongoose.connection.db.admin().command({ replSetInitiate: replicaSetConfig })
        console.log(info)
    } catch (err) {
        console.log(err)
    }
}

async function init() {
    try {
        await connectToMongoDb()
        let rs = await getReplicaSetFromDb()

        if (!rs) {
            await initializeReplicaSetInDb()
        }

        mongoose.connection.close()
    } catch (err) {
        console.log(err)
    }
}

init()
