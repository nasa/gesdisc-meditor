import log from 'log'
import netrc from './netrc'
import fs from 'fs'

let MEDITOR_API_URL = process.env.MEDITOR_API_URL || 'https://uat.gesdisc.eosdis.nasa.gov/meditor/api/'

// create a .netrc file for authenticating with the API
storeCredentialsInNetrc(process.env.URS_BASE_URL || 'urs.earthdata.nasa.gov', fromSecretOrEnv('URS_USER'), fromSecretOrEnv('URS_PASSWORD'))

/**
 * look for the given key as a Docker secret first, then fallback to environment variable for non-Docker swarm installations
 * @param {string} key 
 */
function fromSecretOrEnv(key) {
    const SECRETS_DIR = '/run/secrets/'

    if (fs.existsSync(SECRETS_DIR + key)) {
        return fs.readFileSync(SECRETS_DIR + key).toString()
    } else {
        return process.env[key] || process.env[key.toUpperCase()]
    }
}

/**
 * Creates a .netrc file containing the given credentials
 * @param {string} machine 
 * @param {string} user 
 * @param {string} password 
 */
function storeCredentialsInNetrc(machine, user, password) {
    let ursNetrc = netrc()

    log.debug('Creating .netrc file with credentials for ', machine)

    ursNetrc[machine] = {}
    ursNetrc[machine].login = user
    ursNetrc[machine].password = password

    netrc.save(ursNetrc)
}

/**
 * 
 * @param {*} document 
 * @param {*} modelName 
 * @param {*} index 
 */
export async function addDocumentToModel(document, modelName, index) {
    document['x-meditor'] = {
        model: modelName,
    }

    let tempPath = `${__dirname}/document-${modelName}-${index}.json`

    fs.writeFileSync(tempPath, JSON.stringify(document)) // temporarily save file

    let headers = ['--request POST', "-H 'Content-Type: multipart/form-data'", `-F file=@lib/document-${modelName}-${index}.json`]

    let response = await curl(`putDocument`, headers.join(' '))

    fs.unlinkSync(tempPath) // remove file as we don't need it anymore

    return response
}

/**
 * easy wrapper method to run curl commands against the API
 * @param {*} endpoint 
 * @param {*} headers 
 */
export function curl(endpoint, headers = '') {
    return new Promise((resolve, reject) => {
        const baseCommand = 'curl -b ~/.urs_cookies -c ~/.urs_cookies -L -n '
        const requestUrl = ` ${encodeURI(MEDITOR_API_URL + endpoint)}`
        const curlCommand = baseCommand + headers + requestUrl

        log.debug('Running command ', curlCommand)

        require('child_process').exec(curlCommand, function (err, stdout, stderr) {
            if (err) {
                console.log(err)
                reject(err)
                return
            }

            try {
                resolve(JSON.parse(stdout))
            } catch (e) {
                resolve(stdout)
            }
        })
    })
}
