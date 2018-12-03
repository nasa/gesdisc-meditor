const mongoose = require('mongoose')
const art = require('ascii-art')
const fetch = require('node-fetch')

art.Figlet.fontPath = './'

const UI_URL = 'http://meditor_ui:4200'
const API_URL = 'http://meditor_server:8081/meditor/api/listModels'
const MONGO_URL = 'mongodb://meditor_database:27017'
const MAX_MINUTES_TO_CONNECT = 2
const MILLIS_BETWEEN_ATTEMPTS = 2000
const MAX_ATTEMPTS = MAX_MINUTES_TO_CONNECT * 60 * 1000 / MILLIS_BETWEEN_ATTEMPTS

console.time('Startup time')

function delay(delayMillis) {
    return new Promise(resolve => setTimeout(resolve, delayMillis))
}

async function waitForService(serviceName, serviceUpFn, attempt = 1) {
    let debugMessage = `Checking ${serviceName} status...`

    try {
        await serviceUpFn()
        console.log(`${debugMessage} running!`)
    } catch (err) {
        if (attempt >= (MAX_ATTEMPTS - 1)) {
            console.log(err)
            throw new Error(`${serviceName} did not startup in time!`)
        }
        
        console.log(`${debugMessage} not up yet`)
        await delay(MILLIS_BETWEEN_ATTEMPTS)
        return await waitForService(serviceName, serviceUpFn, ++attempt)
    }
}

async function waitForUi() {
    return await waitForService('UI', async () => {
        if (!(await fetch(UI_URL)).ok) throw new Error()
        return
    })
}

async function waitForMongoReplicaset() {
    return await waitForService('Database', async () => {
        await mongoose.connect(MONGO_URL)
        await mongoose.connection.useDb('meditor')

        return await new Promise((resolve, reject) => {
            mongoose.connection.db.admin().command({ replSetGetStatus: 1 }, (err, result) => {
                err ? reject(err) : resolve(result)
            })
        })
    })
}

async function waitForApi() {
    return await waitForService('API', async () => {
        let res = await fetch(API_URL)
        return await res.json()
    })
}

async function init() {
    try {
        await Promise.all([
            waitForUi(),
            waitForApi(),
            waitForMongoReplicaset(),
        ])

        art.font('Meditor', 'big', rendered => {
            console.log('********************\n\n\n\n')
            console.log(`${rendered}\n\n`)
            console.log(`UI: ${process.env.APP_UI_URL}`)
            console.log(`API: ${process.env.APP_UI_URL}/api/\n\n`)
            console.timeEnd('Startup time')
        })
    } catch (err) {
        console.error('Meditor failed to startup')
        console.error(err)
    }
}

init()
