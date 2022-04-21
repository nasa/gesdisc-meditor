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

## Themes

mEditor will change parts of its user interface based on the current theme. The theme defaults to "default" and can be adjusted to other values through the URL query parameter `theme` or the environment variable `UI_THEME`. Available themes are listed in the file `_app.tsx` under the `THEMES` constant.

### Conflict Resolution

In case of a conflict between an allowed value for the `theme` URL query param, and the environment variable `UI_THEME`, the URL query param wins. Because the URL query param requires allow-listing a value before use (via the `UI_ALLOWED_URL_THEME` environment variable), it can be disabled at the environment variable level (by removing it or changing its value) to allow `UI_THEME` to take precedence. These environment variables allows mEditor to switch, enable, or disable themes without redeployment.

### URL Query Parameters

To be enabled via a URL query param, a theme must first be allow-listed through the environment varaiable `UI_ALLOWED_URL_THEME`, which should be set to an avialable theme.

#### Example Usage

Set the allowed theme.

```bash
echo 'UI_ALLOWED_URL_THEME=EDPub' >> ./.env
```

`http://localhost/meditor?theme=EDPub` or `http://localhost/meditor?theme=edpub` will enable mEditor's EDPub theme.

### `UI_THEME` Environment Variable

To be set the theme via the `UI_THEME` environment variable, set the variable's value to an avaiable theme.

#### Example Usage

Set the allowed theme.

```bash
echo 'UI_THEME=EDPub' >> ./.env
```

The theme is now set. If you also have `UI_ALLOWED_URL_THEME` set, please note Themes' Conflict Resolution section.
