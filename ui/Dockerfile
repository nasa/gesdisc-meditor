FROM node:latest
 
ENV NPM_CONFIG_LOGLEVEL warn
ARG node_env
 
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./
 
RUN npm install
 
CMD if [ "$NODE_ENV" = "production" ]; \
    then \
    npm install -g http-server && \
    npm rebuild node-sass --force && \
    npm run build && \
    cd dist && \
    hs -p 4200; \
    else \
    npm rebuild node-sass --force && \
    npm run client; \
    fi
 
EXPOSE 4200