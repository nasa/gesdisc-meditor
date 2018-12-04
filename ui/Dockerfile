FROM dev.gesdisc.eosdis.nasa.gov:443/node/10.12.0

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./
COPY ./node_modules/angular2-json-schema-form ./node_modules/angular2-json-schema-form

RUN npm install

RUN if [ "$NODE_ENV" = "production" ]; \
	then \
	echo "Not rebuilding node-sass for production builds"; \
	else \
	npm rebuild node-sass --force; \
	fi

RUN npm run build

CMD if [ "$NODE_ENV" = "production" ]; \
	then \
    npm install -g http-server && \
    cd dist && \
    hs -p 4200; \
	else \
	npm run client; \
	fi

EXPOSE 4200
