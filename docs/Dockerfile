ARG REGISTRY
FROM ${REGISTRY}node:18.12.1

WORKDIR /usr/src/app

RUN corepack enable
RUN corepack prepare yarn@3.3.0 --activate

COPY . .
RUN yarn install

RUN yarn clear
RUN yarn clean-api-docs all
RUN yarn gen-api-docs all

EXPOSE 3030

CMD yarn build && yarn serve
