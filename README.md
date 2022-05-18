# mEditor

## Getting Started

- Clone the repo and `cd meditor`
- Copy .env.example, create a **new file** called .env
- mEditor uses Earthdata Login for authentication, so you will need to update `AUTH_CLIENT_ID` and `AUTH_CLIENT_SECRET` in your .env with the values for your client application.
- Build and run the app: `docker-compose up`
  - NOTE: you will see a warning about REGISTRY variable is not set. You can safely ignore this. If you'd like to use a private registry you can set this ENV variable.
- Once everything is up and running (may take a few minutes on the first run), you can access mEditor at: `http://localhost/meditor`
- The first time you load mEditor, it will take you through a step-by-step for setting up the database and initial users.

## Developing in mEditor

- In development, you can make changes in most of the service folders and the service will restart with your changes applied.
- Out of the box, your IDE will show errors for dependencies and will be missing autocompletion for dependencies. This is due to Docker installing dependencies inside the container, inaccessible to the host. To fix this, you can run `npm install` inside whichever service folder you are working on.
- Please create a branch for your changes and when you are finished, create a pull request to have them reviewed and merged in.

## Subscribing to document state changes

When a document in mEditor moves through a workflow (ex. moves to Draft, moves to Published, etc.), mEditor puts that document into a queue (NATS) that can be subscribed to by an external service.

A queue is created for each model. For example, documents in the `Example News` model would be pushed to the `meditor-Example-News` queue.

A document in the queue will look similar to this example:

```json
{
    "id": "",
    "document": {...},
    "model": {...},
    "target": "example",            # (optional) if included, this message is only meant for a certain subscriber
    "state": "Under Review",
    "time": 1580324162703
}
```

The clients are expected to publish an acknowledgement message into the 'meditor-Acknowledgement' queue, with this form:

```json
{
    "time": 1580324162703,
    "id": "",                       # the document ID, send this back so mEditor knows which document to update
    "model": "Example News",        # the model namm
    "target": "example",            # the website/application that handled the document
    "url": "https://example.nasa.gov/news?title=Example%20article",     # an optional URL the document was published to
    "message": "Success!",          # a message to show the user in mEditor (could include a list of errors for failures)
    "statusCode": "200",            # status code to notify mEditor of success vs failure to publish
    "state": "Under Review"
}
```

An example subscriber is located in `./examples/subscriber` and shows how to subscribe to a specific model and how to send acknowledgements back to mEditor.

The built-in notifier, which sends emails to users, is also a subscriber. The notifier subscribes to the `meditor-notifications` queue.

**Note:**

If mEditor is embedded in another application and you'd like to redirect back to the application after a document has been published: include `"redirectToUrl": true` in the acknowledgement message

There is an example of this redirect in examples/subscriber-with-redirect

## Authentication

mEditor allows a user to log in through its user interface or through a POST request to its login endpoint. Earthdata Login and AWS Cognito are both supported for login through the UI, but only AWS Cognito is supported for login through the API. This guide assumes that you know how to set up AWS Cognito for login through the UI.

### Login through UI

To learn more about logging in through mEditor's UI, see [Logging In](https://docs.google.com/document/d/e/2PACX-1vSNC0fvXJ6rbOuuOcAGarA1s4ys3l0mKZ608RgPPlHVvBAYAktxoUWUIsVZqY_QQYN4OvPR6xppz7mI/pub#h.bpeuduphpjz8) within the User Guide.

### Login through API

To log in through mEditor's API, first (and only once) set up a new AWS Cognito App Client within your existing User Pool. Set the environment variable `COGNITO_INITIATE_AUTH_CLIENT_ID` to the value of this new Cognito Client ID.

- Ensure that `ALLOW_USER_PASSWORD_AUTH` is enabled in your Authentication Flow.
- Ensure no client secret is set for the App Client.

Send a POST request to `meditor/api/login` similar to this:

```sh
curl -Lv -X POST 'localhost/meditor/api/login' \
     -H 'Content-Type: application/json' \
     -d '{ "username": "your-username", "password": "your-password" }'
```

The API will send back a reply with either an error or user, and a `set-cookie` header containing a session cookie. If the API response contained a user, that user is now logged in and can interact with the API when requests contain the session cookie. E.g.,

```sh
curl -X GET 'localhost/meditor/api/cloneDocument?model=Example%20News&title=Lorem%20ipsum%20dolor%20sit%20amet&newTitle=New%20Document' \
     -H 'Cookie: __mEditor=s%3AlxPdaElW5qwzWlDiWmQFPYHFGt5k9U5w.qSei3cxoV3Yj4F9KnBaA7wZMXAC3%2FelBcM7UuMjgPfE'
```
