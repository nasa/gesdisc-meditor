const { writeJson } = require('../utils/writer.js')
var log = require('log')

//* Can be any path to match, excluding domain and including only the query parameters you want to match (or none at all).
//* e.g., 'meditor/api/cloneDocument?model=Users' will match 'meditor/api/cloneDocument?model=Users?title=Bob?newTitle=Bob%20The%20Builder'
//* e.g., 'meditor/api/cloneDocument' will match itself or itself plus any query parameters.
const PROTECTED_URLS = [
    '/meditor/api/putModel',
    '/meditor/api/getModel?name=Users',
    '/meditor/api/listDocuments?model=Users',
    '/meditor/api/putDocument',
    '/meditor/api/cloneDocument',
    '/meditor/api/getDocument?model=Users',
    '/meditor/api/changeDocumentState',
    '/meditor/api/resolveComment',
    '/meditor/api/editComment',
    '/meditor/api/logout',
    '/meditor/api/me',
    '/meditor/api/getCsrfToken',
]

function stripTrailingSlash(path) {
    return path.endsWith('/') ? path.replace(/\/*$/, '') : path
}

function isRequestUrlProtected(protectedUrls, requestUrl) {
    return protectedUrls.some(protectedUrl => {
        const [requestPath, requestParamString] = requestUrl.toLowerCase().split('?')
        const [protectedPath, protectedParamString] = protectedUrl
            .toLowerCase()
            .split('?')

        const pathMatch =
            stripTrailingSlash(requestPath) === stripTrailingSlash(protectedPath)

        //* No params are present on this protected url from the list, so this URL matches.
        if (pathMatch && !protectedParamString) {
            return true
        }

        const requestParams = new URLSearchParams(requestParamString)
        const protectedParams = new URLSearchParams(protectedParamString)
        const paramMatches = []

        //* We can control not putting duplicate keys in our protected list, so iterate over all params from the request URL, which we cannot control.
        requestParams.forEach((requestValue, requestKey) => {
            paramMatches.push(protectedParams.get(requestKey) === requestValue)
        })

        //* Paths match and at least one parameter matches, so this route matches.
        if (pathMatch && paramMatches.some(b => b)) {
            return true
        }

        return false
    })
}

function validateUserOnRequest(request) {
    const user = request.user || {}
    const { uid } = user

    return new Promise((resolve, reject) => {
        !!uid ? resolve() : reject()
    })
}

function enforceAuthentication(protectedEndpoints) {
    return async function enforceUserOnRequest(request, response, next) {
        try {
            const isProtected = isRequestUrlProtected(protectedEndpoints, request.url)

            if (isProtected) {
                await validateUserOnRequest(request, response)
            }

            next()
        } catch (error) {
            log.warn(
                `${request.method} on ${
                    request.url
                } attempted with without authentication on ${new Date(
                    Date.now()
                ).toLocaleString()}`
            )

            writeJson(
                response,
                {
                    message: 'This endpoint requires authentication.',
                    statusCode: 401,
                },
                401
            )
        }
    }
}

exports.enforceAuthentication = enforceAuthentication
exports.PROTECTED_URLS = PROTECTED_URLS
