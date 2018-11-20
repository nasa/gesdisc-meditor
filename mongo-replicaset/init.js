const mongoose = require('mongoose')
const replicaSetConfig = require('./rs-config')

const MONGO_URL = "mongodb://meditor_database:27017"
const RECONNECT_TIMEOUT_MILLIS = 2000
const MAX_RECONNECT_ATTEMPTS = 5

const delay = (millisToDelay) => new Promise((resolve) => setTimeout(resolve, millisToDelay))

async function connectToMongoDb(attempt = 1) {
    console.log(`attempting to connect to mongo (attempt #${attempt}): ${MONGO_URL} `)

    try {
        await mongoose.connect(MONGO_URL)
        await mongoose.connection.useDb('meditor')

        console.log('connected successfully!')
        
        return
    } catch (err) {
        if (attempt >= MAX_RECONNECT_ATTEMPTS) throw err

        console.log('waiting for mongo to startup...')

        await delay(RECONNECT_TIMEOUT_MILLIS)

        return connectToMongoDb(++attempt)
    }
}

function doesReplicaSetExist() {
    return new Promise(resolve => {
        mongoose.connection.db.admin().command({ replSetGetStatus: 1 }, (err, result) => resolve(err ? false : true))
    })
}

function initializeReplicaSet() {
    return new Promise((resolve, reject) => {
        mongoose.connection.db.admin().command({ replSetInitiate: replicaSetConfig }, (err, result) => {
            if (err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    })
}

async function init() {
    try {
        await connectToMongoDb()
        
        if (await doesReplicaSetExist()) {
            console.log(`Replica set is already running`)
        } else {
            console.log('Replica set is not running, initialize it')

            await initializeReplicaSet()

            console.log('Initialized successfully')
        }

        mongoose.connection.close()
    } catch (err) {
        console.log(err)
    }
}

init()
