var fs = require('fs');

// This is good for local dev environments, when it's better to
// store a projects environment variables in a .gitignore'd file
require('dotenv').config();

// Would be passed to script like this:
// `node set-env.js --environment=dev`
const environment = process.env.environment;
const isProd = environment === 'prod';

const targetPath = environment && environment !== 'dev' 
  ? `./src/environments/environment.${environment}.ts` 
  : `./src/environments/environment.ts`;
const envConfigFile = `
export const environment = {
  production: ${isProd},
  mongodbServiceUrl: "${process.env.MONGODB_SERVICE_URL}"
};
`
fs.writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }

  console.log(`Output generated at ${targetPath}`);
});