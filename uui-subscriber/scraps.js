// Retrieves metadata and documents for a given modelName and given targetStates
function getMeditorModelMetaAndDocuments(meta, targetStates, modelName) {
  var modelData = {
    model: modelName
  };
  return Promise.resolve()
    .then(res => {
      return meta.dbo.db(DbName)
        .collection("Models")
        .find({name: modelName})
        .project({_id:0})
        .sort({"x-meditor.modifiedOn":-1})
        .limit(1)
        .toArray();
    })
    .then(res => {
      var meditorContentQuery;
      _.assign(modelData, res[0]);
      if (!modelData.titleProperty) modelData.titleProperty = 'title';
      if (modelData.schema) modelData.schema = JSON.parse(modelData.schema);
      // For each document, find if it has any version matching the specified
      // target state
      meditorContentQuery = [
        {$addFields: {
          'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}, // Find last state
          'x-meditor.createdOn': { $arrayElemAt: [ "$x-meditor.states.modifiedOn", 0 ]}, // Find first edit (in mEditor, this is most likely the date of most recent edit)
          'x-meditor.publishedOn': { $arrayElemAt: [ "$x-meditor.states.modifiedOn", -1 ]} // Find last state transition
        }},
        {$match: {'x-meditor.state': {$in: targetStates}}}, // Filter states based on the specified state
        {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
        {$group: {_id: '$' + modelData.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version with the specified state
        {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
      ];
      return meta.dbo
        .db(DbName)
        .collection(modelName)
        .aggregate(meditorContentQuery)
        .toArray();
    })
    .then(res => {
      var meditorCreatedOnQuery;
      var projection = {
        createdOn: 1
      };
      var matcher = {};
      modelData.meditorDocs = res;
      // Now build a new query to retrive the very first version of each of the matching
      // documents. This is needed to find out the true creation date
      projection[modelData.titleProperty] = 1;
      matcher[modelData.titleProperty] = {$in: res.map(doc => doc[modelData.titleProperty])};
      meditorCreatedOnQuery = [
        {$match: matcher},
        {$addFields: {
          'createdOn': { $arrayElemAt: [ "$x-meditor.states.modifiedOn", 0 ]}, // Find first edit
        }},
        {$sort: {"x-meditor.modifiedOn": 1}}, // Sort ascending by version (date)
        {$group: {_id: '$' + modelData.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version with the specified state
        {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
        {$project: projection}
      ];
      return meta.dbo
        .db(DbName)
        .collection(modelName)
        .aggregate(meditorCreatedOnQuery)
        .toArray();
    })
    .then(res => {
      var titles = res.reduce(function (accumulator, currentValue) {
        accumulator[currentValue[modelData.titleProperty]] = currentValue.createdOn;
        return accumulator;
      }, {});
      // Use the results to set the true creation date of each document, if available
      modelData.meditorDocs.forEach(doc => {
        if (doc[modelData.titleProperty] in titles) doc['x-meditor'].createdOn = titles[doc[modelData.titleProperty]];
      })
      // Return the results
      return Promise.resolve(modelData);
    });
};



// Pushes all items from a mEditor model specified in params
// into UUI and purges from UUI items that are no longer
// present in mEditor. Every item pushed into UUI is marked
// as 'source=meditor'. Consequently, sync removes and updates
// only those items in UUI that are markes as 'source=meditor'.
// All other items in UUI are essentially invisible to this code.
function syncItems(syncTarget, params) {
  console.log('Syncronizing documents with UUI. Target:', syncTarget, 'Model:', params);
  if (uuiConfig.PUBLISHABLE_MODELS.indexOf(params.model) === -1) return Promise.resolve(); // Ignore models not supported in UUI
  var meta = {
    params: params,
    modelData: {},
    UUI_APP_URL: syncTarget.uuiUrl.replace(/\/+$/, ''),
    target: syncTarget
  };
  var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];
  var contentSelectorQuery = uuiConfig.SYNC_MEDITOR_DOCS_ONLY ? '?originName=[$eq][meditor]' : '';
  var defaultModelGroup = {
    uuiModelName: getUuiModelName(params.model),
    meditorModelNames: [params.model]
  };
  var modelGroup = _.find(uuiConfig.MEDITOR_MODEL_GROUPS, function (g) {
    return g.meditorModelNames.indexOf(params.model) !== -1
  }) || defaultModelGroup;
  _.assign(meta, modelGroup);

  if (isDryRun()) {
    console.error('UUI sync is disabled. Running in Dry Run mode - changes will NOT be propagated to UUI. Set PUBLISH_TO_UUI to true to enable sync.');
  }

  return MongoClient.connect(MongoUrl)
    .then(res => {
      meta.dbo = res;
      // Analyze each of the sibling models as defined by the group and retrieve
      // metadata and documents for each model
      return Promise.all(modelGroup.meditorModelNames.map(model => getMeditorModelMetaAndDocuments(meta, syncTarget.states, model)));
    })
    .then(res => {
      meta.meditorModelData = {};
      // Stored returned metadata and documents under each model's name in meta.meditorModelData
      res.forEach(modelRes => {
        meta.meditorModelData[modelRes.model] = modelRes;
      });
      return loginIntoUrs({
        user: uuiConfig.URS_USER,
        password: uuiConfig.URS_PASSWORD,
        redirectUri: meta.UUI_APP_URL + '/login/callback',
        clientId: uuiConfig.UUI_AUTH_CLIENT_ID
      });
    })
    .then(res => {
      meta.cookiejar = res;
      // Verify we logged in - request user profile info
      let requestParams = {
        url: meta.UUI_APP_URL + '/api/users/me',
        headers: uuiConfig.UUI_HEADERS,
        json: true,
        jar: meta.cookiejar,
        gzip: true
      }

      return requests(requestParams);
    })
    .then(res => {
      console.log('Logged in into UUI as', res.uid, 'with roles for ' + meta.params.model + ': ', _.get(res, 'roles.' + meta.uuiModelName, []));
      // Acquire UUI CSRF token
      return requests({
        url: meta.UUI_APP_URL + '/api/csrf-token',
        headers: uuiConfig.UUI_HEADERS,
        json: true,
        jar: meta.cookiejar,
        gzip: true
      });
    })
    .then(res => {
      uuiConfig.UUI_HEADERS['x-csrf-token'] = res.csrfToken;
      return requests({
        url: meta.UUI_APP_URL + '/api/' + meta.uuiModelName + contentSelectorQuery,
        headers: uuiConfig.UUI_HEADERS,
        json: true,
        jar: meta.cookiejar,
        gzip: true
      });
    })
    .then(res => res.data || [])
    .then(res => {
      // Compute unique identifiers for each of the meditor documents
      // for each of the target model and target this.state
      // After that, flatten the array of id arrays
      var meditorIds = [].concat(...Object.values(meta.meditorModelData).map(modelData => modelData.meditorDocs.map(doc => {
        if (uuiConfig.DEBUG_MODE) console.log('Meditor doc ID: ', syncTarget.targetLabel, getDocumentUid(modelData, doc))
        return getDocumentUid(modelData, doc)
      })));
      // Compute document ids that currently reside in UUI
      meta.uuiIds = res.map(doc => {
        if (uuiConfig.DEBUG_MODE) console.log('Doc ID found in UUI:', meta.UUI_APP_URL, syncTarget.targetLabel, doc.originData);
        return doc.originData
      });
      // Compute and schedule items to remove from UUI (uui ids that are in uui, but not in meditor)
      return res.reduce((promiseChain, uuiDoc) => {
        return promiseChain.then(chainResults =>
          ((meditorIds.indexOf(uuiDoc.originData) === -1) ? removeDocument(meta, uuiDoc) : Promise.resolve())
          .then(currentResult => [...chainResults, currentResult])
        );
      }, Promise.resolve([]));
    })
    .then(res => {
      // Compute and schedule items to add to UUI (umeditor ids that are in meditor, but not uui)
      // Do this by iterating through each of the target models and publishing documents from that model
      return Object.keys(meta.meditorModelData).reduce((promiseChain, model) => {
        return promiseChain.then(chainResults =>
          (pushModelDocuments(meta, model))
          .then(currentResult => [...chainResults, currentResult])
        );
      }, Promise.resolve([]));
    })
    .then(res => {})
    .then(res => (meta.dbo.close()))
    .catch(err => {
      try {
        meta.dbo.close()
      } catch (e) {};
      console.error(err.status || err.statusCode, err.message || 'Unknown error');
      return Promise.reject({
        status: err.status || err.statusCode,
        message: err.message || 'Unknown error'
      });
    });
};