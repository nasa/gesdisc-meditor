/**
 * Migrated from the Swagger generated mEditorAPI
 *
 * TODO: remove after migration to NextAuth
 */

const fetchIntercept = attach()

let interceptors = []

function interceptor(fetch, ...args) {
    const reversedInterceptors = interceptors.reduce(
        (array, interceptor) => [interceptor].concat(array),
        []
    )
    let promise = Promise.resolve(args)

    // Register request interceptors
    reversedInterceptors.forEach(({ request, requestError }) => {
        if (request || requestError) {
            promise = promise.then(args => request(...args), requestError)
        }
    })

    // Register fetch call
    promise = promise.then(args => fetch(...args))

    // Register response interceptors
    reversedInterceptors.forEach(({ response, responseError }) => {
        if (response || responseError) {
            promise = promise.then(response, responseError)
        }
    })

    return promise
}

export function attach() {
    if (typeof fetch === 'undefined') {
        throw Error('No fetch available. Unable to register interceptors')
    }

    // @ts-ignore
    fetch = (function (fetch) {
        return function (...args) {
            return interceptor(fetch, ...args)
        }
    })(fetch)

    return {
        register: function (interceptor) {
            interceptors.push(interceptor)
            return () => {
                const index = interceptors.indexOf(interceptor)
                if (index >= 0) {
                    interceptors.splice(index, 1)
                }
            }
        },
        clear: function () {
            interceptors = []
        },
    }
}

export function attachInterceptor(registration) {
    return fetchIntercept.register(registration)
}
