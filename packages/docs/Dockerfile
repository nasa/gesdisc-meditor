ARG REGISTRY
FROM ${REGISTRY}node:22.11.0 as base

ENV NPM_CONFIG_LOGLEVEL=warn

WORKDIR /home/node/app

COPY --chown=node:node . /home/node/app/
RUN npm install

FROM base as production
RUN npm run gen-api-docs all
RUN npm run build

EXPOSE 3030

CMD npm run serve
