'use strict';

var fs = require('fs'),
    path = require('path'),
    http = require('http');

var app = require('connect')();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var cors = require('cors');
var serverPort = 8081;

var nats = require('./controllers/lib/nats-connection');

// swaggerRouter configuration
var options = {
  swaggerUi: path.join(__dirname, '/swagger.json'),
  controllers: path.join(__dirname, './controllers'),
  useStubs: process.env.NODE_ENV === 'development' // Conditionally turn on stubs (mock mode)
};

// The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(path.join(__dirname,'api/swagger.yaml'), 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Connect to NATS Streaming
nats.stan.on('connect', function() {
  console.log('Connected to NATS');

  // Initialize the Swagger middleware
  swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
    if (process.env.NODE_ENV === 'development') {
      app.use(cors({credentials: true, origin: 'http://localhost:4000'}));
    }

    // Init authentication
    require('./controllers/Users').init(app);

    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());

    // Validate Swagger requests
    app.use(middleware.swaggerValidator());

    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter(options));

    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());

    // Start the server
    http.createServer(app).listen(serverPort, function () {
      console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
      console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    });
  });
})

nats.stan.on('error', function(reason) {
  console.log(reason);
})
