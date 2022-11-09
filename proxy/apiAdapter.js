/// <reference path="./node_modules/njs-types/ngx_http_js_module.d.ts" />
/**
 * NGINX JavaScript: https://nginx.org/en/docs/njs/index.html
 * Types: https://nginx.org/en/docs/njs/typescript.html, but cannot make without other dependencies installed on our host machines, so https://www.npmjs.com/package/njs-types is used.
 */

const BASE_PATH = '/meditor/api/';

/**
 * Add header from the sub-request's response to NGINX's request (which ultimately gets returned as a response). This allows us to defer the API logic to our Next.js API.
 * @param {NginxHTTPRequest} request
 * @param {NginxHTTPRequest} response
 */
function passThroughHeaders(request, response) {
    for (const prop in response.headersOut) {
        if (response.headersOut.hasOwnProperty(prop)) {
            request.headersOut[prop] = response.headersOut[prop];
        }
    }
}

/**
 * Adapt an incoming request to mEditor's first API to mEditor's new API.
 * By convention:
 *  - always pass through the HTTP method so that the underlying new API can handle appropriately.
 *  - always pass through the HTTP headers with `passThroughHeaders`
 *  - since the resource title can contain non-URL-friendly characters, encodeURIComponent
 *
 * @param {NginxHTTPRequest} request
 */
async function adapt(request) {
    const args = request.args;
    const method = request.method;
    const uri = request.uri;

    switch (uri) {
        case BASE_PATH + 'getComments': {
            try {
                const response = await request.subrequest(
                    BASE_PATH +
                        'models/' +
                        encodeURIComponent(args.model) +
                        '/documents/' +
                        encodeURIComponent(args.title) +
                        '/comments',
                    { method }
                );

                passThroughHeaders(request, response);

                request.return(response.status, response.responseBody);
            } catch (error) {
                ngx.log(ngx.ERR, error);

                //* Do not expose the error to the end-user.
                request.return(
                    500,
                    JSON.stringify({ message: 'Internal Server Error' })
                );
            }

            break;
        }

        case BASE_PATH + 'getDocumentHistory': {
            try {
                const response = await request.subrequest(
                    BASE_PATH +
                        'models/' +
                        encodeURIComponent(args.model) +
                        '/documents/' +
                        encodeURIComponent(args.title) +
                        '/history',
                    { method }
                );

                passThroughHeaders(request, response);

                request.return(response.status, response.responseBody);
            } catch (error) {
                ngx.log(ngx.ERR, error);

                //* Do not expose the error to the end-user.
                request.return(
                    500,
                    JSON.stringify({ message: 'Internal Server Error' })
                );
            }

            break;
        }

        case BASE_PATH + 'getDocumentPublicationStatus': {
            try {
                const response = await request.subrequest(
                    BASE_PATH +
                        'models/' +
                        encodeURIComponent(args.model) +
                        '/documents/' +
                        encodeURIComponent(args.title) +
                        '/publications',
                    { method }
                );

                passThroughHeaders(request, response);

                request.return(response.status, response.responseBody);
            } catch (error) {
                ngx.log(ngx.ERR, error);

                //* Do not expose the error to the end-user.
                request.return(
                    500,
                    JSON.stringify({ message: 'Internal Server Error' })
                );
            }

            break;
        }

        default: {
            ngx.log(
                ngx.ERR,
                JSON.stringify({
                    message: uri + ' does not have an API adapter.',
                })
            );

            //* Do not expose the error to the end-user.
            request.return(
                500,
                JSON.stringify({ message: 'Internal Server Error' })
            );

            break;
        }
    }
}

export default { adapt };
