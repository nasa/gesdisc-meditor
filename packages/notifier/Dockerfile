ARG REGISTRY
FROM ${REGISTRY}node:10.12.0

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ./ ./

RUN npm install

CMD npm run start
