UUI Import - Export funcitons
=====================================

The package contains the following items:

schemas
  - This folder contains Meditor schemas describing every content type available in UUI. Note that 'schema' and 'layout' parameters in each schema is unescaped for a convenience of editing. Please run 'node import-uui-schemas.js' to import all schemas into 'meditor' MongoDB database with a proper escaping of 'schema' and 'layout'.

import-uui-schemas.js
  - This NodeJS script is used to import all Meditor schemas from the 'schemas' folder into 'meditor' MongoDB database.

uui-to-meditor.js
  - This NodeJS script is used to import all documents from 'uui-db' MongoDB database into 'meditor' MongoDB database.