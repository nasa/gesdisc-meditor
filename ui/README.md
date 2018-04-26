# Meditor

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.7.1.

## Development (Local)

Before running Meditor locally on your own machine, please refer to the "Environment Configuration" section for instructions on creating your own environment setup.

Run `npm start` for running the application locally on your own machine. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.  

If you wish to run meditor on a different port simply run `npm start -- --port=1234`.  You can then navigate to `http://localhost:1234`. 

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Configuration

### Environment Configuration (`.env`)
All environment variables should be defined in a file named `.env` located directly under the `ui` directory.  Here is a brief example of how the `.env` contents might look like:

`MONGODB_SERVICE_URL=http://localhost:1234/`

The only environment variable entry that should be set in the `.env` file is `MONGODB_SERVICE_URL`.  It should be given a URL to the instance of a mongodb service you wish to work with.

### Environment File Generation
Running `npm start` should automatically generate an environment file for your local environment.  

Running `npm build` should automatically generate an environment file for your production environment.

However, If you wish to generate a configuration file on your own then run `npm run config`.  This will create an environment file for your local development environment called `environment.ts` located under `ui/src/environments/`.  This file is based on the variables defined in your `.env` file located under the `ui` directory.  

If you wish to only generate the environment file for production , run `npm run config -- --environment=prod`.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).  Use the `--port` flag to avoid CORS issues.

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
