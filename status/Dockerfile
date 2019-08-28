FROM registry1.gesdisc.eosdis.nasa.gov/certified/node:10.12.0

RUN mkdir -p /usr/src
WORKDIR /usr/src
COPY ./ ./

RUN npm install

CMD npm run start