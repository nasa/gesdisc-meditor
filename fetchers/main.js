import log from 'log'
import cron from 'node-cron'
import fs from 'fs'
import { curl, addDocumentToModel } from './lib/api'
import { chunkArray } from './lib/batch'
import * as models from './models/index'
require('log-node')()

const SIMULTANEOUS_UPLOADS = 5      // max number of simultaneous uploads to mEditor

async function runFetcherTask(key, fetcher) {
    console.log('\n\n')
    log.notice(`Starting "${key}" fetcher`)

    let results

    try {
        results = await fetcher.fetch()

        log('Logging in...')

        await curl('login')

        const user = await curl('me')

        log(`Logged in as: ${user.uid}`)


    } catch (err) {
        log.notice(`Failed to run "${key}" fetcher`)
        log.error(err)
        return
    }

    let batchedResults = chunkArray(results, SIMULTANEOUS_UPLOADS)

    // clear out any existing documents before proceeding
    for (let i = 0; i < SIMULTANEOUS_UPLOADS; i++) {
        if (fs.existsSync(`${__dirname}/lib/document-${fetcher.modelName}-${i}.json`)) {
            fs.unlinkSync(`${__dirname}/lib/document-${fetcher.modelName}-${i}.json`)
        }
    }

    while (batchedResults.length) {
        let uploads = []

        batchedResults[batchedResults.length - 1].forEach((item, i) => {
            // make sure this is at least a valid object
            if (item && Object.keys(item).length) {
                log.debug('Uploading item ', item)
                uploads.push(addDocumentToModel(item, fetcher.modelName, i))
            } else {
                console.log('Skipping invalid item ', item)
                uploads.push(new Promise((resolve) => resolve()))
            }
        })

        await Promise.all(uploads)

        batchedResults.pop()
    }

    log.notice(`"${key}" fetcher completed successfully\n\n`)
}

let cronJobs = Object.keys(models).map(key => {
    log.notice(`Scheduling "${key}" fetcher for ${models[key].schedule}`)

    return cron.schedule(models[key].schedule, async () => runFetcherTask(key, models[key]))
})

// gracefully handle shutdown by destroying any running cronjobs
process.on('SIGTERM', () => {
    log.notice('SIGTERM received, stopping all cronjobs')
    
    cronJobs.forEach(job => {
        job.stop()
        job.destroy()
    })
})
