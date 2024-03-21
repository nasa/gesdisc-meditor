ARG REGISTRY
FROM ${REGISTRY}python:3.9.1

RUN mkdir -p /usr/src/app
RUN apt-get update

WORKDIR /usr/src/app

COPY . .

RUN pip install -r requirements.txt

CMD python -m flask run --host=0.0.0.0 --port 8080

EXPOSE 8080
