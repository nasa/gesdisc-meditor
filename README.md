# Meditor

The Meditor stack is comprised of these projects:

* Angular
* Material Design
* Node.js
* Mongo
* Swagger/OpenAPI

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

All meditor images are stored in the registry: dev.gesdisc.eosdis.nasa.gov:443

Production mode doesn't use the .env file as described above, it uses environment variables.

* `docker swarm init` (if not already part of a swarm)
* `printf "ASK_SOMEONE_FOR_THIS" | docker secret create auth_host -`
* `printf "ASK_SOMEONE_FOR_THIS" | docker secret create auth_client_id -`
* `printf "ASK_SOMEONE_FOR_THIS" | docker secret create auth_client_secret -`
* `env HOST_NAME=``hostname`` docker stack deploy -c docker-compose.production.yml --with-registry-auth meditor`

### Releasing a new version

`./release.sh`

* Builds fresh Docker images
* Bumps the minor version number (i.e. 0.1.0 -> 0.2.0)
* Updates the UI to display the new version
* Updates the docker-compose.production.yml to use the new version
* Git commits and pushes the version changes
* Pushes the new Docker images to the registry
