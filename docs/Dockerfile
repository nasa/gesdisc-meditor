ARG REGISTRY
FROM ${REGISTRY}node:16.11.0

ARG node_env

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

EXPOSE 3030

CMD if [ "$NODE_ENV" = "production" ]; \
    then \
    npm run start; \
    else \
    npm run dev; \
    fi
