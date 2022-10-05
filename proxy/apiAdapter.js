/// <reference path="./node_modules/njs-types/ngx_http_js_module.d.ts" />
/**
 * NGINX JavaScript: https://nginx.org/en/docs/njs/index.html
 * Types: https://nginx.org/en/docs/njs/typescript.html, but cannot make without other dependencies installed on our host machines, so https://www.npmjs.com/package/njs-types is used.
 */

const BASE_PATH = '/meditor/api/';

/**
 * @param {NginxHTTPRequest} request
 */
async function adapt(request) {
    const args = request.args;
    const method = request.method;
    const uri = request.uri;

    switch (uri) {
        case BASE_PATH + 'getComments':
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

                request.return(response.status, response.responseBody);
            } catch (error) {
                request.return(500, error);
            }

            break;

        default:
            request.return(
                500,
                JSON.stringify({
                    message: uri + ' does not have an API adapter.',
                })
            );
            break;
    }
}

export default { adapt };
