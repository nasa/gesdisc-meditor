Seeds the database with Cypress specific workflows, models, and users. Should be run before any Cypress test run to ensure the database is at a starting point.

### How to run

`seed_db.js` is automatically run when using the npm script `npm run test:cypress` from the `/app` folder

### Adding seeded data

Prefix any new models and/or workflows with "Cypress" to ensure we keep the test data isolated
