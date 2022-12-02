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
                //* Parse the form-data through an API call so that we can know to which modelName this document belongs.
                const formDataRequestUrl = `${BASE_PATH}parse/form-data`;
                const formDataResponse = await request.subrequest(
                    formDataRequestUrl,
                    {
                        method,
                        body: request.requestBuffer,
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
