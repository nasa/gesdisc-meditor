FROM registry1.gesdisc.eosdis.nasa.gov/certified/node:10.12.0

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
EXPOSE 4000

CMD if [ "$NODE_ENV" = "production" ]; \
	then \
	npm run build && \
    npm run start; \
	else \
	npm run dev; \
	fi
