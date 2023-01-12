# mEditor RESTful API

API routes should use [REST conventions](https://restfulapi.net/resource-naming/).

For mEditor, this would follow this structure: /models/{modelName}/documents/{documentTitle}

## Old API Redirects

The old API is supported by using NGINX's `js_module`, expressed in `apiAdapter.js`. See `nginx.conf.template` and `apiAdapter.js` comments for more detailed context.
