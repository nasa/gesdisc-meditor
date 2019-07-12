'use strict';
var _ = require('lodash');
var mongo = require('mongodb');
var requests = require('request-promise-native');
var MongoClient = mongo.MongoClient;
var mFile = require('./lib/meditor-mongo-file');

const DEBUG_URS_LOGIN = false;
// Meditor models supported in UUI
const PUBLISHABLE_MODELS = ['Alerts', 'Data-In-Action', 'Documents', 'FAQs', 'Glossary',
  'Howto', 'Images', 'New News', 'News', 'Publications', 'Tools', 'Data Release', 'Service Release'];
const FILE_BASED_UUI_MODELS = ['news', 'images', 'tools'];

// Try to load up environment config if not loaded already
if (!!process.env.MEDITOR_ENV_FILE_PATH) {
  try {
    require('dotenv').config({
      path: process.env.MEDITOR_ENV_FILE_PATH
    });
  } catch (e) {
    console.log('WARNING: Failed to load authorization info');
  }
}

var MongoUrl = process.env.MONGOURL;
var DbName = "meditor";

var SYNC_MEDITOR_DOCS_ONLY = process.env.SYNC_MEDITOR_DOCS_ONLY || false; // Update only those items in UUI that originated from mEditor

var UUI_AUTH_CLIENT_ID = process.env.UUI_AUTH_CLIENT_ID;
var UUI_APP_URL_FOR_PUBLISHED = process.env.UUI_APP_URL_OPS;
var UUI_APP_URL_FOR_TEST = process.env.UUI_APP_URL_TEST;
var URS_USER = process.env.URS_USER;
var URS_PASSWORD = process.env.URS_PASSWORD;

const SYNC_TARGETS = [{
  state: 'Published',
  uuiUrl: UUI_APP_URL_FOR_PUBLISHED,
  targetLabel: 'OPS'
}, {
  state: 'Draft',
  uuiUrl: UUI_APP_URL_FOR_TEST,
  targetLabel: 'Test'
}];

// This parameter can be used to push from multiple mEditor models into a single model in UUI
const MEDITOR_MODEL_GROUPS = [
  {
    uuiModelName: 'news',
    meditorModelNames: ['News', 'New News'],
  },
  {
    uuiModelName: 'data-release',
    meditorModelNames: ['Data Release'],
  },
  {
    uuiModelName: 'service-release',
    meditorModelNames: ['Service Release'],
  },
];

var URS_BASE_URL = 'https://urs.earthdata.nasa.gov';
var URS_HEADERS = { // A minimal viable set of URS headeres
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Content-Type': 'application/x-www-form-urlencoded'
  // 'Host': 'urs.earthdata.nasa.gov',
  // 'Connection': 'keep-alive',
  // 'Content-Length': 336,
  // 'Pragma': 'no-cache',
  // 'Cache-Control': 'no-cache',
  // 'Origin': 'https://urs.earthdata.nasa.gov',
  // 'Upgrade-Insecure-Requests': 1,
  // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
  // 'Referer': 'https://urs.earthdata.nasa.gov/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(UUI_APP_URL) + '%2Flogin%2Fcallback&client_id=' + UUI_AUTH_CLIENT_ID,
  // 'Accept-Language': 'en-US,en;q=0.9'
}

var UUI_HEADERS = { // A minimal viable set of UUI headeres
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept': 'application/json, text/plain, */*',
  'Content-Type': 'application/json;charset=utf-8'
  //'Pragma': 'no-cache',
  // 'Accept-Language': 'en-US,en;q=0.9',
  // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36',
  //'Referer': UUI_APP_URL + '/',
  //'DNT': '1',
  // 'Connection': 'keep-alive',
  // 'Cache-Control': 'no-cache'
}

// Steps:

// A. Authentication into UUI using URS
// 0. Load up URS credentials from a file into environment.
// 1. Load up urs.earthdata.nasa.gov/oath/authorize and accept a cookie.
// 2. Extract CSRF authenticity_token from the form on the oath/authorize page.
// 3. POST user name, password, authenticity_token, and a few other static form fields (along the cookie) to https://urs.earthdata.nasa.gov/login.
// 4. If all inputs are correct, URS will return a new cookie and forward us back to urs.earthdata.nasa.gov/oath/authorize.
// 5. If the new URS login cookie is correct (that is, logged in), urs.earthdata.nasa.gov/oath/authorize will forward us to UUI with a security code.
// 6. Upon receiving the security code from URS, UUI will return a session cookie.
// 7. Using UUI cookie, request CSRF token from UUI. This token needs to be put in the header in all authorized UUI API calls.
// 8. At this point, we are fully authorized and are ready to talk to UUI's content editing API .

// B. Publishing
// 1. Get a list of all published items in UUI (titles & content type)
// 2. Get a list of all published items in mEditor (titles & content type)
// 3. Find delta_missing - items present in mEditor, but not UUI (they need to be added to UUI)
// 4. Find delta_extraneous - items present in UUI, but not mEditor (they need to be removed from UUI)
// 5. Remove extraneous items from delta_extraneous from UUI
// 6. Push missing items from delta_missing to UUI

// Can be used to debug URS redirect login chain
if (DEBUG_URS_LOGIN) {
  require('request-debug')(requests, function (eventType, eventData) {
    console.log(eventType, eventData.uri, eventData.method);
    console.log(eventData.headers);
    if (eventType === 'request') console.log(eventData.body);
    console.log('\n\n\n\n--------------------------------\n\n\n\n');
  });
}

// Tells us whether we should in fact update UUI or just 'probe' it
function isDryRun() {
  return (((process.env.PUBLISH_TO_UUI || '') + '').toLowerCase() !== 'true');
}

// Returns a unique identifier for a given mEdiotor document
// Used for provenance when writing a document to UUI
function getDocumentUid(metadata, meditorDoc) {
  return encodeURIComponent(_.get(meditorDoc, metadata.titleProperty)) + '_' + (_.get(meditorDoc, 'x-meditor.publishedOn') || _.get(meditorDoc, 'x-meditor.modifiedOn'));
}

// Converts mEditor model name into UUI model name
function getUuiModelName(model) {
  return model.toLowerCase().replace(/ /g, '-');
}

// Modified from: https://stackoverflow.com/questions/30366324/
function jsonUnescape(j) {
  if (!_.isString(j)) return j;
  // Note: this does not account for \uxxx - not sure if we have any
  ['b', 'f', 'n', 'r', 't', '"'].forEach(function (c) {
    j = j.split('\\' + c).join(JSON.parse('"\\' + c + '"'));
  });
  return j;
}

// Imitates a browser - based login into URS
function loginIntoUrs(params) {
  var cookiejar = requests.jar();
  var URS_OAUTH_URL = URS_BASE_URL.replace(/\/+$/, '') + '/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(params.redirectUri) + '&client_id=' + params.clientId;
  var URS_LOGIN_URL = URS_BASE_URL.replace(/\/+$/, '') + '/login';
  return Promise.resolve()
    .then(res => {
      return requests({
        url: URS_OAUTH_URL,
        jar: cookiejar
      });
    })
    .then(res => {
      const token = res.match(/name\=\"authenticity\_token\"\s+value\=\"(.*?)\"/)[1]; // Find CSRF token in the form
      return requests.post({
        url: URS_LOGIN_URL,
        headers: URS_HEADERS,
        jar: cookiejar,
        followAllRedirects: true,
        gzip: true,
        form: {
          'utf8': '✓',
          'authenticity_token': token,
          'username': params.user,
          'password': params.password,
          'client_id': params.clientId,
          'redirect_uri': params.redirectUri,
          'response_type': 'code',
          'state': null,
          'stay_in': 1,
          'commit': 'Log+in'
        }
      });
    })
    .then(res => {
      return cookiejar;
    });
}

// Helper function used in removeTargetUrlFromDocumentMetadataForAllTargets
// Pulls all records of publishing a document with a given title to a given
// target url
var removeTargetUrlFromDocumentMetadata = function(meta, model, title, targetUrl) {
  return new Promise(function (resolve, reject) {
    meta.dbo.db(DbName).collection(model).updateMany({
      title: title
    }, {$pull: {'x-meditor.publishedTo': {'link': targetUrl}}}, function (err, res) {
      if (err) return reject(err, res);
      resolve();
    });
  });
};

// Helper function for removing a record of publishing a document to a target
// Since multiple models in mEditor can map to a single model in UUI, iterate
// through all possible sibling mEditor models for a given updated model
var removeTargetUrlFromDocumentMetadataForAllTargets = function(meta, title, targetUrl) {
  return Object.keys(meta.meditorModelData).reduce((promiseChain, model) => {
    return promiseChain.then(chainResults =>
      (removeTargetUrlFromDocumentMetadata(meta, model, title, targetUrl))
      .then(currentResult => [...chainResults, currentResult])
    );
  }, Promise.resolve([]));
};

// Pushes a mEditor document into UUI
function pushDocument(meta, model, meditorDoc) {
  // targetUrl is where this pushed document will be available in UUI
  var targetUrl = meta.UUI_APP_URL + '/information/' + meta.uuiModelName + '?' + 'title=' + encodeURIComponent(_.get(meditorDoc, meta.meditorModelData[model].titleProperty));
  return Promise.resolve()
    .then(res => {
      console.log('Publishing [' + _.get(meditorDoc, meta.meditorModelData[model].titleProperty) + '] of type [' + model + '] to UUI [' + meta.uuiModelName + ']', isDryRun() ? '(Dry Run Mode)' : '');
      if (isDryRun()) return resolve();
      // Fetch image from GridFS if necessary
      return ((_.isNil(meditorDoc.image) || !/^[a-f\d]{24}$/i.test(meditorDoc.image)) ? Promise.resolve() : mFile.getFileSystemItem(meta.dbo.db(DbName), meditorDoc.image))
    })
    .then(function (image) {
      var postedModel = {};
      var postRequest;
      var uui_headers = _.cloneDeep(UUI_HEADERS);
      postedModel = _.cloneDeep(meditorDoc);
      _.assign(postedModel, {
        'title': _.get(meditorDoc, meta.meditorModelData[model].titleProperty),
        'published': true,
        'lastPublished': _.get(meditorDoc, 'x-meditor.publishedOn') || _.get(meditorDoc, 'x-meditor.modifiedOn'),
        'updated': _.get(meditorDoc, 'x-meditor.modifiedOn'),
        'created': _.get(meditorDoc, 'x-meditor.createdOn') || _.get(meditorDoc, 'x-meditor.modifiedOn'),
        'originName': 'meditor',
        'originData': getDocumentUid(meta.meditorModelData[model], meditorDoc)
      });

      postRequest = {
        url: meta.UUI_APP_URL + '/api/' + meta.uuiModelName,
        headers: uui_headers,
        jar: meta.cookiejar,
        followAllRedirects: true,
        gzip: true
      }
      if (image) {
        if (FILE_BASED_UUI_MODELS.indexOf(meta.uuiModelName) !== -1 && image.indexOf('base64') !== -1) {
          // A case of file-based model in UUI. Needs to be send as a form.
          delete postedModel.image; // Remove image from request body (we will add it later)
          // Image stored in Base64 like this "image" : "data:image/png;base64,iVBORw0KGgoAA..."
          image = image.split(',');
          image[0] = image[0].replace(/[:;]/g, ',').split(',');
          
          // Add image binary
          postedModel.fileRef = {
            value: new Buffer(image[1], 'base64'),
            options: {
              filename: _.get(meditorDoc, meta.meditorModelData[model].titleProperty),
              contentType: image[0][1]
            }
          }
        } else {
          // A case of non-file based model. Image URL is simply an attribute of the model.
          postedModel.image = image;
        }
      }
      if (FILE_BASED_UUI_MODELS.indexOf(meta.uuiModelName) !== -1 && postedModel.fileRef) {
        // File-based documents are submitted as a form
        // Convert all keys to string as required by the form-encoded transport
        uui_headers['Content-Type'] = 'multipart/form-data';
        Object.keys(postedModel).forEach(function (key) {
          var shouldUnescape = !(postedModel[key] instanceof Object);
          if (key === 'fileRef') return;
          postedModel[key] = JSON.stringify(postedModel[key]);
          if (shouldUnescape) postedModel[key] = jsonUnescape(postedModel[key]);
          postedModel[key] = _.trim(postedModel[key], '"') + "";
        });
        postRequest.formData = postedModel;
        postRequest.preambleCRLF = true;
        postRequest.postambleCRLF = true;
      } else {
        //Documents without image are submitted as JSON
        postRequest.json = true;
        postRequest.body = postedModel;
      }
      return requests.post(postRequest)
    })
    .then(res => {
      // Make sure to remove all previous records of publishing this document to a given target
      return removeTargetUrlFromDocumentMetadataForAllTargets(meta, _.get(meditorDoc, meta.meditorModelData[model].titleProperty), targetUrl);
    })
    .then(res => {
      // Make a record in 'x-meditor.publishedTo' of publishing the document
      // to a given targetUrl
      return new Promise(function (resolve, reject) {
        meta.dbo.db(DbName).collection(model).updateOne({
          _id: meditorDoc._id
        }, {$addToSet: {'x-meditor.publishedTo': {
          'target': 'GES DISC Web site (' + meta.target.targetLabel + ')',
          'link': targetUrl,
          'publishedOn': (new Date()).toISOString()
        }
        }}, function (err, res) {
          if (err) return reject(err, res);
          resolve();
        });
      });
    })
    .then(res => {
      return targetUrl;
    });
}

// Removes a document with a given title from UUI
function removeDocument(meta, uuiDoc) {
  // targetUrl is a URL of a UUI document that is being removed
  var targetUrl = meta.UUI_APP_URL + '/information/' + meta.uuiModelName + '?' + 'title=' + encodeURIComponent(uuiDoc.title);
  return Promise.resolve()
    .then(res => {
      console.log('Removing [' + uuiDoc.title + '] of type [' + meta.uuiModelName + '] from UUI [' + meta.uuiModelName + ']', isDryRun() ? '(Dry Run Mode)' : '');
      if (isDryRun()) return resolve();
      return requests.delete({
        url: meta.UUI_APP_URL + '/api/' + meta.uuiModelName + '/' + encodeURIComponent(encodeURIComponent(uuiDoc.title)),
        headers: UUI_HEADERS,
        jar: meta.cookiejar,
        followAllRedirects: true
      });
    })
    .then(function() {
      // Update 'x-meditor.publishedTo' to indicate our document is no longer in UUI
      return removeTargetUrlFromDocumentMetadataForAllTargets(meta, uuiDoc.title, targetUrl);
    })
    .then(res => {
      return targetUrl;
    });

};

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

function pushModelDocuments(meta, model) {
  var modelData = meta.meditorModelData[model];
  // Compute and schedule items to push to UUI
  return modelData.meditorDocs.reduce((promiseChain, mDoc) => {
    return promiseChain.then(chainResults =>
      ((meta.uuiIds.indexOf(getDocumentUid(modelData, mDoc)) === -1) ? pushDocument(meta, model, mDoc) : Promise.resolve())
      .then(currentResult => {
        return [...chainResults, currentResult];
      })
    );
  }, Promise.resolve([]));
};

// Pushes all items from a mEditor model specified in params
// into UUI and purges from UUI items that are no longer
// present in mEditor. Every item pushed into UUI is marked
// as 'source=meditor'. Consequently, sync removes and updates
// only those items in UUI that are markes as 'source=meditor'.
// All other items in UUI are essentially invisible to this code.
function syncItems(syncTarget, params) {
  console.log('Syncronizing documents with UUI. Target:', syncTarget, 'Model:', params);
  if (PUBLISHABLE_MODELS.indexOf(params.model) === -1) return Promise.resolve(); // Ignore models not supported in UUI
  var meta = {
    params: params,
    modelData: {},
    UUI_APP_URL: syncTarget.uuiUrl.replace(/\/+$/, ''),
    target: syncTarget
  };
  var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];
  var contentSelectorQuery = SYNC_MEDITOR_DOCS_ONLY ? '?originName=[$eq][meditor]' : '';
  var defaultModelGroup = {
    uuiModelName: getUuiModelName(params.model),
    meditorModelNames: [params.model]
  };
  var modelGroup = _.find(MEDITOR_MODEL_GROUPS, function (g) {
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
      return Promise.all(modelGroup.meditorModelNames.map(model => getMeditorModelMetaAndDocuments(meta, [syncTarget.state], model)));
    })
    .then(res => {
      meta.meditorModelData = {};
      // Stored returned metadata and documents under each model's name in meta.meditorModelData
      res.forEach(modelRes => {
        meta.meditorModelData[modelRes.model] = modelRes;
      });
      return loginIntoUrs({
        user: URS_USER,
        password: URS_PASSWORD,
        redirectUri: meta.UUI_APP_URL + '/login/callback',
        clientId: UUI_AUTH_CLIENT_ID
      });
    })
    .then(res => {
      meta.cookiejar = res;
      // Verify we logged in - request user profile info
      return requests({
        url: meta.UUI_APP_URL + '/api/users/me',
        headers: UUI_HEADERS,
        json: true,
        jar: meta.cookiejar,
        gzip: true
      });
    })
    .then(res => {
      console.log('Logged in into UUI as', res.uid, 'with roles for ' + meta.params.model + ': ', _.get(res, 'roles.' + meta.uuiModelName, []));
      // Acquire UUI CSRF token
      return requests({
        url: meta.UUI_APP_URL + '/api/csrf-token',
        headers: UUI_HEADERS,
        json: true,
        jar: meta.cookiejar,
        gzip: true
      });
    })
    .then(res => {
      UUI_HEADERS['x-csrf-token'] = res.csrfToken;
      return requests({
        url: meta.UUI_APP_URL + '/api/' + meta.uuiModelName + contentSelectorQuery,
        headers: UUI_HEADERS,
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
        return getDocumentUid(modelData, doc)
      })));
      // Compute document ids that currently reside in UUI
      meta.uuiIds = res.map(doc => {
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

// Process a single model sync request from the request queue
module.exports.processQueueItem = function (data) {
  return SYNC_TARGETS.reduce((promiseChain, syncTarget) => {
    return promiseChain.then(chainResults =>
      (syncItems(syncTarget, data))
      .then(currentResult => [...chainResults, currentResult])
    );
  }, Promise.resolve([]));
};

module.exports.syncAll = function() {
  return PUBLISHABLE_MODELS.reduce((promiseChain, syncModel) => {
    return promiseChain.then(chainResults =>
      (module.exports.processQueueItem({"model": syncModel}))
      .then(currentResult => [...chainResults, currentResult])
    );
  }, Promise.resolve([]));
};

// module.exports.processQueueItem({"model": "News"}); // test stub
// module.exports.syncAll(); // Can be used to force sync of all models
