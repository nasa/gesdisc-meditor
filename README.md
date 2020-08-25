# mEditor

### Getting Started

* Clone the repo and `cd meditor`
* Copy .env.example, create a **new file** called .env
* mEditor uses Earthdata Login for authentication, so you will need to update `AUTH_CLIENT_ID` and `AUTH_CLIENT_SECRET` in your .env with the values for your client application.
* Build and run the app: `docker-compose up`
* Once everything is up and running (may take a few minutes on the first run), you can access mEditor at: `http://localhost/meditor`
* The first time you load mEditor, it will take you through a step-by-step for setting up the database and initial users.

### Subscribing to document state changes

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
