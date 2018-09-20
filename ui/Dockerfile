FROM node:latest

ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./

RUN mkdir -p node_modules/node-sass/vendor/linux-x64-51
RUN curl -L https://github.com/sass/node-sass/releases/download/v4.9.3/linux-x64-51_binding.node -o node_modules/node-sass/vendor/linux-x64-51/binding.node
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
