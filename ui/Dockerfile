FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/

RUN npm cache clean --force
RUN npm install
COPY ./ /usr/src/app/
RUN npm run build -- --output-path=./dist/out

EXPOSE 4200

CMD npm run client
