const MongoClient = require('mongodb').MongoClient
const replicaSetConfig = require('./rs-config')

const MONGO_URL = process.env.MONGOURL || "mongodb://meditor_database:27017"
const RECONNECT_TIMEOUT_MILLIS = 2000
const MAX_RECONNECT_ATTEMPTS = 5

async function connectToMongoDb(attempt = 1) {
    console.log(`attempting to connect to mongo (attempt #${attempt}) `)
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
        console.log('Replica set is not running')
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
