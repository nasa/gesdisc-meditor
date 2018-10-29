const MongoClient = require('mongodb').MongoClient
const Server = require('mongodb').Server
const ReplSetServers = require('mongodb').ReplSetServers
const replicaSetConfig = require('./rs-config')

const MONGO_URL = process.env.MONGOURL || "mongodb://meditor_database:27017"
const RECONNECT_TIMEOUT_MILLIS = 2000
const MAX_RECONNECT_ATTEMPTS = 5

async function connectToMongoDb(attempt = 1) {
    try {
        return await MongoClient.connect(MONGO_URL)
    } catch (err) {
        if (attempt >= MAX_RECONNECT_ATTEMPTS) throw err

        console.log('waiting for mongo to startup...')
        setTimeout(() => connectToMongoDb(++attempt), RECONNECT_TIMEOUT_MILLIS)
    }
}

async function getReplicaSetFromDb(db) {
    try {
        let adminDb = db.db('meditor').admin()
        let info = await adminDb.replSetGetStatus()
        console.log(`Replica set ${info.set} is running`)
        return info
    } catch (err) {
        return null
    }
}

async function initializeReplicaSetInDb(db) {
    try {
        let adminDb = db.db('meditor').admin()
        let info = await adminDb.command({ replSetInitiate: replicaSetConfig })
        console.log(info)
    } catch (err) {
        console.log(err)
    }
}

async function init() {
    let db = await connectToMongoDb()
    let rs = await getReplicaSetFromDb(db)

    if (!rs) {
        await initializeReplicaSetInDb(db)
    }

    db.close()
}

init()
