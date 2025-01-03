ARG REGISTRY
FROM ${REGISTRY}python:3.13.1-alpine

RUN mkdir -p /usr/src/app
RUN apk update
RUN apk upgrade

WORKDIR /usr/src/app

COPY . .

RUN pip install -r requirements.txt

CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"] 

EXPOSE 8080
