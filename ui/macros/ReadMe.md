# Template Macros

Macros are made with an internal DSL for running queries written into a model's template, used to populate a model's schema, called with the `getModel` service (or a service that calls `getModel`). Template macros are defined on a Model's `templates` property, and look something like:

```json
{
    "templates": [
        {
            "jsonpath": "$.properties.tags.items.enum",
            "macro": "list Keywords.title"
        }
    ]
}
```

The list macro defined above will generate a list of unique titles from within the `Keywords` collection in the database, replacing the data on the model at the `jsonpath` with its return value. In this case, `model.schema.properties.tags.items.enum` would have a value of `'placeholder'` initially, then get replaced with a list of unique news titles. This can be used in the UI to create comboboxes, selects, etc. Other macros follow this general syntax of `{macro name} {macro argument}`.

## 'list'

This macro returns a list of unique document titles.

```json
{
    "templates": [
        {
            "jsonpath": "$.properties.news.items.enum",
            "macro": "list News.title"
        }
    ]
}
```

Further breaking down `list`'s `macro` field `list News.title`:

-   `list` is the macro's name.
-   `News` is the database collection
-   `title` is the News model's title property. This part of the argument is used to group records by, so it should always be the title property of the model: mEditor's data model expects unique titles.

## 'listDependenciesByTitle'

The macro generates a [JSONSchema dependencies section](https://json-schema.org/understanding-json-schema/reference/conditionals.html).

```json
{
    "templates": [
        {
            "jsonpath": "$.dependencies",
            "macro": "listDependenciesByTitle DAAC.cmrProviders[].CmrProvider"
        }
    ]
}
```

Further breaking down `listDependenciesByTitle`'s `macro` field `listDependenciesByTitle DAAC.cmrProviders[].CmrProvider`:

-   The above macro would get a list of all DAACs with their cmrProviders and build a dependency tree out of it.
-   Selecting a DAAC would populate the "CmrProvider" field enum with a list of only that DAAC's CMR Providers.
