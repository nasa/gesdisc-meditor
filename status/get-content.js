module.exports.getContent = function (url) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? require('https') : require('http')

        const request = lib.get({
            host: 'localhost',
            path: '/meditor',
            headers: {
                'accept': 'application/json'
            }
        }, (response) => {
            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to get content, status code: ' + response.statusCode))
            }
            
            // temporary data holder
            const body = []
            
            // on every content chunk, push it to the data array
            response.on('data', (chunk) => body.push(chunk))
            
            // we are done, resolve promise with those joined chunks
            response.on('end', () => resolve(body.join('')))
        })

        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    })
}