---
title: Contributing to mEditor
---

# Contributing

Thank you for your interest in contributing to mEditor! With the help of others, we are confident mEditor will continue to grow into a feature rich tool. You can contribute in a few ways, whether it's finding bugs, adding new features, or improving documentation. We welcome them all!

Contributions to mEditor must follow our [Code of Conduct](/code-of-conduct).

## mEditor's Philosophy

mEditor was created to fill the need for a tool that humanizes complex data while providing dynamic workflows to manage information lifecycle management.

mEditor can support any kind of schema based data, whether it is science data, website content, or configuration files. The goal is for users to have an easy to use interface for interacting with the data and an open-ended publication platform.

We don't restrict where the data is used, as mentioned it can be published to data repositories, to websites, or to servers. We even use the data to send email notifications!

## Submitting an issue

You can submit an issue through our [GitHub repository](https://github.com/nasa/gesdisc-meditor). For reference, GitHub has excellent [documentation on creating issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue).

## Development server

To contribute, ensure you have the development server running. See the [Getting Started](/readme#getting-started) instructions in our [ReadMe](/readme).

When developing, you can access mEditor at http://localhost/meditor

## First Time Contributors

If this is your first time contributing to mEditor, take a moment to read/understand the mEditor documentation, including:

-   [ReadMe](/readme) - we include a helpful README in this same repository that should get you up and running quickly for local development
-   [The mEditor User Guide](/user-guide) - details taking a document through a "Edit -> Review -> Publish" workflow
-   [API endpoints](/api)
-   [mEditor subscribers](https://wiki.earthdata.nasa.gov/display/MEDITOR/mEditor+subscribers) - responsible for publishing documents to external websites/applications, such as CMR
-   [Example publication workflow](https://wiki.earthdata.nasa.gov/display/MEDITOR/mEditor+Publication+Workflow) - how mEditor publishes to external websites/applications
-   [User authentication](https://wiki.earthdata.nasa.gov/display/MEDITOR/User+Authentication) - mEditor currently supports Earthdata Login and AWS Cognito

## Coding Style

All the Javascript/Typescript code in this project uses a [custom Prettier config](https://www.npmjs.com/package/@gesdisc/prettier-config) to match our preferred formatting style. Code should be prettified before commit.

## Tests

-   `npm run test` - runs Jest unit/integration tests
-   `npx cypress` - runs Cypress visual/e2e tests

All contributions should include tests.

## Pull Requests

As a pull request author, your responsibility is to make sure your code is complete, of good quality, and accurately completes the issue you are resolving.

Reviewing pull requests is hard and can be time-consuming, so you should do everything you can to respect the reviewers time by preemptively catching issues and prepping the pull request.

### Pull Request Author Checklist

Please review this checklist before adding reviewers:

1. Do my code changes adequately resolve the story I was assigned?
2. Is my PR too large (would I groan if I was assigned to it?) If it is, have I broken the PR down into smaller PRs?
3. Have I included unit and/or integration tests? If I haven't, have I included a note in the description that explains why?
4. Have I removed unnecessary debug lines (console.logs, print lines)?
5. Have I removed commented out code?
6. Have I cleaned up the formatting? (indentation matches, adequate whitespace)
7. Is my code of good quality? https://www.geeksforgeeks.org/7-tips-to-write-clean-and-better-code-in-2020/
8. Am I using semantic, well named functions/methods/variables?
9. Do my functions/methods/classes follow single responsibility principle?
10. Did I write a useful description that will aid the reviewer in understanding the code changes and how to run them?
11. Will comments in the PR help the reviewer understand how the changes work together and have I added those comments?
