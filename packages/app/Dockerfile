ARG REGISTRY
FROM ${REGISTRY}node:22.11.0

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 4000

CMD if [ "$NODE_ENV" = "production" ]; \
  then \
  npm run start; \
  else \
  npm run docker:dev; \
  fi
