API routes should use REST conventions: https://restfulapi.net/resource-naming/

For mEditor, this would follow this structure: /models/{modelName}/documents/{documentTitle}

NOTE: Make sure to add a redirect to next.config.js if you are moving a route from the old API structure!

examples:
/meditor/api/listModels -> /meditor/api/models
/meditor/api/getDocument?model=Alerts&title=My Alert -> /meditor/api/models/Alerts/documents/My Alert
