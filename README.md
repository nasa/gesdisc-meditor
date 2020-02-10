# Meditor

The Meditor stack is comprised of these projects:

* Angular
* Material Design
* Node.js
* Mongo
* Swagger/OpenAPI

### Subscribing to published documents

mEditor pushes published documents into a queue (NATS) that can be subscribed to by an external service.
Each document type has its own queue, e.g., 'meditor-News' for News and so on.

A document in the queue will look similar to this example:

```json
{
    "id": "",
    "document": {...},
    "model": {...},
    "target": "uui",            # (optional) if included, this message is only meant for a certain subscriber
    "state": "Under Review",
    "time": 1580324162703
}
```

The clients are expected to publish an acknowledgement message into the 'meditor-Acknowledgement' queue:

```json
{
    "time": 1580324162703,
    "id": "Example article",
    "model": "News",
    "target": "uui",
    "url": "https://disc.gsfc.nasa.gov/information/news?title=Example%20article",
    "message": "Success!",
    "statusCode": "200",
    "state": "Under Review"
}
```

An example subscriber is located in `./examples/subscriber`. Run `npm install` then `npm run start` to see it in action.

To "publish" a test document using the stub, run `node ./examples/subscriber/stubs/publish.js` in a separate terminal. You should see output in both the publisher stub and the subscriber.

### Developing Locally

The easiest way to get up and running is via Docker:

* Clone this repo and do `cd meditor`.
* Copy .env.example, create a **new file** called .env
* Inside this file, you'll need to modify `AUTH_CLIENT_ID` and `AUTH_CLIENT_SECRET` with the real values (ask someone)
* Build and run the app: `docker-compose up`
* Access parts of the app on these ports:
    * Frontend: [http://localhost:4200](http://localhost:4200)
    * Node.js backend: [http://localhost:8081](http://localhost:8081)
    * Mongo: [http://localhost:27017](http://localhost:27017)

### Running production

All meditor images are stored in the registry: registry1.gesdisc.eosdis.nasa.gov

Production mode doesn't use the .env file as described above, it uses environment variables.

* `docker swarm init` (if not already part of a swarm)
* `printf "ASK_SOMEONE_FOR_THIS" | docker secret create auth_host -`
* `printf "ASK_SOMEONE_FOR_THIS" | docker secret create auth_client_id -`
* `printf "ASK_SOMEONE_FOR_THIS" | docker secret create auth_client_secret -`
* `docker node ls` - copy node ID for next step
* `docker node update --label-add database=primary {NODEID}`
* `env HOST_NAME=``hostname`` docker stack deploy -c docker-compose.production.yml --with-registry-auth meditor`

### Releasing a new version

`./release.sh`

* Builds fresh Docker images
* Bumps the minor version number (i.e. 0.1.0 -> 0.2.0)
* Updates the UI to display the new version
* Updates the docker-compose.production.yml to use the new version
* Git commits and pushes the version changes
* Pushes the new Docker images to the registry
