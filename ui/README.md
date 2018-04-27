# Meditor

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

## Installation

### Getting Started
1.) First, install the following software if you haven't done so already:  
NodeJS - https://nodejs.org/en/  
Git - https://git-scm.com/downloads  

### MongoDB Check
2.)  Verify with a senior team member that you have correctly set up an ingest of the mongo database in your environment if you plan to run the application locally.

### Meditor Repository Setup  
3.)  Create a folder for which you would like to store your Git repository.

4.)  Open a browser window and navigate to ecc.earthdata.nasa.gov (NOTE: you will need permissions to access the Meditor repository)

5.)  Navigate to the **mEditor** git source repository.

7.)  Click on the "git" button on the right hand corner of the **mEditor** description card.

8.)  Click on the **mEditor** link under "Repositories".

9.)  Click on the "Clone" button on the options panel in the left.

10.)  Copy the URL provided.

11.)  Navigate to the created folder from step 3 using a command line window and run the following command:
`git clone <the URL copied from step 10>`

12.)  Run the following command: `npm install`

### Environment Configuration
13.)  Create a new file called `.env` under the `ui` directory.

14.)  All environment variables should be defined in the `.env` file.  Here is a brief example of what the `.env` contents might look like:

`MONGODB_SERVICE_URL=http://localhost:1234/`

The only environment variable entry that should be set in the `.env` file is `MONGODB_SERVICE_URL`.  It should be given a URL to the instance of a mongodb service you wish to work with.  Other variables can be set, but they will be ignored by the application.

## Development (Local)

Before running Meditor locally on your own machine, please refer to the "Environment Configuration" section for instructions on setting up your own environment.

Run `npm start`. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.  

If you wish to run meditor on a different port simply run `npm start -- --port=1234` where `1234` is the name of your port.  You can then navigate to `http://localhost:1234`. 

### Troubleshooting
#### Can't Connect to DB Service
  * Make sure that the application and the database service are not on the same port
  * You may need to enter the following code under the service to avoid issues with CORS:
  <pre>
  app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });
  </pre>
  If your application is not running on port `4200` be sure to replace the port number for the URL under the `Access-Control-Allow-Origin` header setting to the proper port number.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Environment File Generation (optional)
Creating an environment file for your environment entirely depends on the contents of your `.env` file, so make sure that you have that created and configured correctly before continuing.

Normally, you don't need to worry about generating an environment file since `npm start` and `npm build` will automatically generate one for you.  The `npm start` command will generate the `environment.ts` file used when running the application locally on your machine.  The `npm build` command will generate the `environment.prod.ts` file which is used for production.  These environment files can then be found under `ui/src/environments/`.  Both files can exist at the same time without causing problems while running the application.

If you wish to generate the `environment.ts` on your own then run `npm run config`.

Generating the `environment.prod.ts` file for production can be done by running `npm run config -- --environment=prod`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).  Use the `--port` flag to avoid CORS issues.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
