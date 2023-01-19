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
 * The mEditor legacy API used query params extensively. For NextJS we are using path-based resources instead.
 * This function pulls out "reserved" keys from the request args and returns the rest as URLSearchParams
 *
 * The equivalent to a spread operation: `const params = { keyword1, keyword2, ...therest } = args`
 *
 * @param {*}           obj
 * @param {object}      options
 * @param {string[]}    options.keysToOmit
 * @returns
 */
function requestArgsToQueryString(requestArgs, options) {
    if (options.keysToOmit) {
        options.keysToOmit.forEach((key) => {
            delete requestArgs[key];
        });
    }

    /**
     * converts an object of request args to an array of key/value pairs
     * if the value of the arg is an array, we only use the first item in the array
     *
     * example:
     * `"pretty": ["true", "false"]` would be turned into `pretty=true`
     */
    const queryStringParts = Object.keys(requestArgs).reduce(
        (queryString, key) => {
            const value = Array.isArray(requestArgs[key])
                ? requestArgs[key][0]
                : requestArgs[key];
            queryString.push(`${key}=${value}`);
            return queryString;
        },
        []
    );

    return queryStringParts.join('&');
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
        case BASE_PATH + 'changeDocumentState': {
            try {
                const response = await request.subrequest(
                    BASE_PATH +
                        'models/' +
                        encodeURIComponent(args.model) +
                        '/documents/' +
                        encodeURIComponent(args.title) +
                        '/change-document-state',
                    {
                        method:
                            request.method === 'GET' ? 'POST' : request.method,
                        args: 'state=' + encodeURIComponent(args.state), // add state as a query param
                        // TODO: pass through query params?
                    }
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

        case BASE_PATH + 'getComments': {
            try {
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.model
                )}/documents/${encodeURIComponent(args.title)}/comments`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args, {
                        keysToOmit: ['model', 'title'],
                    }),
                });

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

        case BASE_PATH + 'getDocument': {
            try {
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.model
                )}/documents/${encodeURIComponent(args.title)}${
                    !!args.version ? `/${encodeURIComponent(args.version)}` : ''
                }`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args, {
                        keysToOmit: ['model', 'title', 'version'],
                    }),
                });

                passThroughHeaders(request, response);

                request.return(response.status, response.responseBuffer);
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
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.model
                )}/documents/${encodeURIComponent(args.title)}/history`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args, {
                        keysToOmit: ['model', 'title'],
                    }),
                });

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
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.model
                )}/documents/${encodeURIComponent(args.title)}/publications`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args, {
                        keysToOmit: ['model', 'title'],
                    }),
                });

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

        case BASE_PATH + 'getModel': {
            try {
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.name
                )}`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args, {
                        keysToOmit: ['name'],
                    }),
                });

                passThroughHeaders(request, response);

                request.return(response.status, response.responseBuffer);
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

        case BASE_PATH + 'listDocuments': {
            try {
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.model
                )}/documents`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args, {
                        keysToOmit: ['model'],
                    }),
                });

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

        case BASE_PATH + 'listModels': {
            try {
                const subrequestUrl = `${BASE_PATH}models`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    args: requestArgsToQueryString(args),
                });

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

        case BASE_PATH + 'putDocument': {
            try {
                // this endpoint used a request body file, so we'll first have to read the buffer in as a file
                const requestBuffer = require('fs').readFileSync(
                    request.variables.request_body_file
                );

                //* Parse the form-data through an API call so that we can know to which modelName this document belongs.
                const formDataRequestUrl = `${BASE_PATH}parse/form-data`;
                const formDataResponse = await request.subrequest(
                    formDataRequestUrl,
                    {
                        method,
                        body: requestBuffer,
                    }
                );

                const parsedFormDataResponse = JSON.parse(
                    formDataResponse.responseText
                );

                //* multipart/form-data could contain multiple boundary-separated documents (though in practice, we know that putDocument only attaches one). Loop through the responses and send a subrequest for each document.
                parsedFormDataResponse.forEach(async (documentString) => {
                    const document = JSON.parse(documentString);

                    const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                        document['x-meditor'].model
                    )}/documents`;

                    const response = await request.subrequest(subrequestUrl, {
                        method,
                        body: documentString,
                        // TODO: pass through query params?
                    });

                    passThroughHeaders(request, response);

                    request.return(response.status, response.responseBody);
                });
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

        case BASE_PATH + 'cloneDocument': {
            try {
                const subrequestUrl = `${BASE_PATH}models/${encodeURIComponent(
                    args.model
                )}/documents/${encodeURIComponent(
                    args.title
                )}/clone-document?newTitle=${args.newTitle}`;

                const response = await request.subrequest(subrequestUrl, {
                    method,
                    // TODO: pass through query params?
                });

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
