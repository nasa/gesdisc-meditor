# Template

This template is built for [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Usage

```bash
npx create-docusaurus@2.2.0 my-website
```

> When prompted to select a template choose `Git repository`.

Template Repository URL:

```bash
https://github.com/PaloAltoNetworks/docusaurus-template-openapi-docs.git
```

> When asked how the template repo should be cloned choose "copy" (unless you know better).

```bash
cd my-website
npm i
```

### Local Development

```bash
npm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```bash
npm run build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Generate API Docs

```bash
npm run gen-api-docs meditor
```

This command generates static content into the `build` directory for the API documentation and can be served using any static contents hosting service.
