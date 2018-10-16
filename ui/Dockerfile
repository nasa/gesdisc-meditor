FROM node:latest

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./
COPY ./node_modules/angular2-json-schema-form ./node_modules/angular2-json-schema-form

RUN npm install
RUN npm rebuild node-sass --force

CMD if [ "$NODE_ENV" = "production" ]; \
	then \
    npm install -g http-server && \
	npm run build && \
    cd dist && \
    hs -p 4200; \
	else \
	npm run client; \
	fi

EXPOSE 4200
