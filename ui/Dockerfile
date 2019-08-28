FROM registry1.gesdisc.eosdis.nasa.gov/certified/node:10.12.0

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./
COPY ./node_modules/angular2-json-schema-form ./node_modules/angular2-json-schema-form

RUN npm uninstall node-sass
RUN npm install node-sass
RUN npm install
RUN npm install -g @angular/cli
RUN npm install -g http-server
RUN npm run build

CMD if [ "$NODE_ENV" = "production" ]; \
	then \
    cd dist && \
    hs -p 4200; \
	else \
	npm run client; \
	fi

EXPOSE 4200
