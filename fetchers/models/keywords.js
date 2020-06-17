import requests from 'request-promise-native'
import log from 'log'

const UUI_APP_URL = 'https://disc.gsfc.nasa.gov'

export const modelName = 'Keywords'
export const schedule = '0 2 * * *' // everyday at 2am

/**
 * returns an array of results, each item in that array will be added to the model as a new document
 * do any manipulation of the results here (such as mapping fields, changing formats of values, etc.)
 */
export const fetch = async () => {
    let url = UUI_APP_URL + '/service/keywords/jsonwsp'

    log.debug('Fetching keywords from ', url)

    let response = await requests.post({
        url,
        headers: {
            'Accept-Encoding': 'gzip, deflate, br',
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json;charset=utf-8',
        },
        followAllRedirects: true,
        gzip: true,
        json: true,
        body: {"methodname": "getKeywords", "args":{"role":"subset"},"type":"jsonwsp/request","version":"1.0"}
    })

    return response.result.items.map(item => ({
        title: item,
        ['x-meditor']: {
            model: modelName,
        },
    }))
}
