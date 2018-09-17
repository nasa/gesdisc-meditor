FROM node:latest

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./

RUN npm install

CMD if [ "$NODE_ENV" = "production" ]; \
	then \
    npm run prod; \
	else \
    npm run dev; \
	fi

EXPOSE 8081
