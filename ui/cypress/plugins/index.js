/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

const { spawn } = require('child_process')

const exec = commands => spawn(commands, { shell: true })

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config

    on('task', {
        'db:seed': async scenarioName => {
            return new Promise((resolve, reject) => {
                const seedProcess = exec('npm run test:cypress-seed')

                seedProcess.stdout.on('data', data => {
                    console.log(`${data}`)
                })

                seedProcess.stderr.on('data', data => {
                    console.error(`db:seed: ${data}`)
                })

                seedProcess.on('close', code => {
                    if (code === 0) {
                        resolve(true)
                    } else {
                        reject(`db:seed child process exited with code ${code}`)
                    }
                })
            })
        },
    })
}
