'use strict';
var _ = require('lodash');
var mongo = require('mongodb');
var requests = require('request-promise-native');
var MongoClient = mongo.MongoClient;
var mFile = require('./lib/meditor-mongo-file');

const DEBUG_URS_LOGIN = false;

// Try to load up environment config if not loaded already
if (!!process.env.MEDITOR_ENV_FILE_PATH) {
  try {
    require('dotenv').config({path: process.env.MEDITOR_ENV_FILE_PATH});
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

var SYNC_TARGETS = [{
        state: 'Published',
        uuiUrl: UUI_APP_URL_FOR_PUBLISHED
    }, {
        state: 'In Test',
        uuiUrl: UUI_APP_URL_FOR_TEST
    }
];

// This parameter can be used to push from multiple mEditor models into a single model in UUI
var MEDITOR_MODEL_GROUPS = [
  { 
    uuiModelName: 'news',
    meditorModelNames: ['News', 'New News']
  }
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
    require('request-debug')(requests, function(eventType, eventData) {
        console.log(eventType, eventData.uri, eventData.method);
        console.log(eventData.headers);
        if (eventType === 'request') console.log(eventData.body);
        console.log('\n\n\n\n--------------------------------\n\n\n\n');
    });
}

function isDryRun() {
    return (((process.env.PUBLISH_TO_UUI || '') + '').toLowerCase() !== 'true');
}

// Returns a unique identifier for a given mEdiotor document
// Used for provenance when writing a document to UUI
function getDocumentUid (metadata, meditorDoc) {
    return encodeURIComponent(_.get(meditorDoc, metadata.titleProperty)) + '_' + meditorDoc['x-meditor'].modifiedOn;
}

// Converts mEditor model name into UUI model name
function getUuiModelName (model) {
    return model.toLowerCase();
}

// Modified from: https://stackoverflow.com/questions/30366324/
function jsonUnescape(j) {
    // Note: this does not account for \uxxx - not sure if we have any
    ['b', 'f', 'n', 'r', 't', '"'].forEach(function(c) {
       j=j.split('\\' + c).join(JSON.parse('"\\' + c + '"'));
    });
    return j;
}

// Imitates a browser - based login into URS
function loginIntoUrs (params) {
    var cookiejar = requests.jar();
    var URS_OAUTH_URL = URS_BASE_URL.replace(/\/+$/, '') + '/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(params.redirectUri) +'&client_id=' + params.clientId;
    var URS_LOGIN_URL = URS_BASE_URL.replace(/\/+$/, '') + '/login';
    return Promise.resolve()
        .then(res => {
            return requests({url: URS_OAUTH_URL, jar: cookiejar});
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
                    'utf8':'✓',
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
        .then(res => {return cookiejar;});
}

function pushDocument(meta, model, meditorDoc) {
    return new Promise(function(resolve, reject) {
        console.log('Pushing [' + _.get(meditorDoc, meta.meditorModelData[model].titleProperty) + '] of type [' + model + '] to UUI [' + meta.uuiModelName + ']', isDryRun() ? '(Dry Run Mode)' : '');
        if (isDryRun()) return resolve();
        // Fetch image from GridFS if necessary
        ((_.isNil(meditorDoc.image)) ? Promise.resolve() : mFile.getFileSystemItem(meta.dbo.db(DbName), meditorDoc.image)).then(function(image) {
            var postedModel = {};
            var postRequest;
            var uui_headers = _.cloneDeep(UUI_HEADERS);
            postedModel = _.cloneDeep(meditorDoc);
            _.assign(postedModel, {
                'title': _.get(meditorDoc, meta.meditorModelData[model].titleProperty),
                'published': true,
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
                // Image is stored in Base64 like this "image" : "data:image/png;base64,iVBORw0KGgoAA..."
                image = image.split(',');
                image[0] = image[0].replace(/[:;]/g, ',').split(',');
                postedModel.image = null;
                delete postedModel.image; // Remove image from request body (we will add it later)
                // Add image binary
                postedModel.fileRef = {
                    value: new Buffer(image[1], 'base64'),
                    options: {
                        filename: _.get(meditorDoc, meta.meditorModelData[model].titleProperty),
                        contentType: image[0][1]
                    }
                }
            }
            if (!!meta.meditorModelData[model].schema.properties.image) {
                // File-based documents are submitted as a form
                // Convert all keys to string as required by the form-encoded transport
                uui_headers['Content-Type'] = 'multipart/form-data';
                Object.keys(postedModel).forEach(function(key) {
                    if (key === 'fileRef') return;
                    postedModel[key] = _.trim(jsonUnescape(JSON.stringify(postedModel[key])), '"') + "" ;
                });
                postRequest.formData = postedModel;
                postRequest.preambleCRLF = true;
                postRequest.postambleCRLF = true;
            } else {
                //Documents without image are submitted as JSON
                postRequest.json = true;
                postRequest.body = postedModel;
            }
            requests.post(postRequest).then(resolve, reject);
        })
    });
}

function removeDocument(meta, uuiDoc) {
    return new Promise(function(resolve, reject) {
        console.log('Removing [' + uuiDoc.title + '] of type [' + meta.uuiModelName + '] from UUI [' + meta.uuiModelName + ']', isDryRun() ? '(Dry Run Mode)' : '');
        if (isDryRun()) return resolve();
        requests.delete({
            url: meta.UUI_APP_URL + '/api/' + meta.uuiModelName + '/' + encodeURIComponent(encodeURIComponent(uuiDoc.title)),
            headers: UUI_HEADERS,
            jar: meta.cookiejar, 
            followAllRedirects: true
        }).then(resolve, reject)
    });
}

// Retrieves metadata and documents for a given modelName and given targetStates
function getMeditorModelMetaAndDocuments(meta, targetStates, modelName) {
    var modelData = {model: modelName};
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
            meditorContentQuery = [
                {$addFields: {'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}}}, // Find last state
                {$match: {'x-meditor.state': {$in: [targetStates]}}}, // Filter states based on the specified state
                {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
                {$group: {_id: '$' + meta.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version with the specified state
                {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
            ];
            return meta.dbo
                .db(DbName)
                .collection(modelName)
                .aggregate(meditorContentQuery)
                .toArray();
        })
        .then(res => {
            modelData.meditorDocs = res;
            return Promise.resolve(modelData);
        });
};

function pushModelDocuments(meta, model) {
  var modelData = meta.meditorModelData[model];
  // Compute and schedule items to push to UUI
  return modelData.meditorDocs.reduce((promiseChain, mDoc) => {
    return promiseChain.then(chainResults => 
        ((meta.uuiIds.indexOf(getDocumentUid(modelData, mDoc)) === -1) ? pushDocument(meta, model, mDoc): Promise.resolve())
            .then(currentResult => [ ...chainResults, currentResult ])
    );
  }, Promise.resolve([]));
};

// Pushes all items from a mEditor model specified in params
// into UUI and purges from UUI items that are no longer
// present in mEditor. Every item pushed into UUI is marked
// as 'source=meditor'. Consequently, sync removes and updates
// only those items in UUI that are markes as 'source=meditor'.
// All other items in UUI are essentially invisible to this code.
function syncItems (syncTarget, params) {
    console.log('Syncronizing documents with UUI. Target:', syncTarget, 'Model:', params);
    var meta = {
        params: params,
        modelData: {},
        UUI_APP_URL: syncTarget.uuiUrl.replace(/\/+$/, '')
    };
    var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];
    var contentSelectorQuery = SYNC_MEDITOR_DOCS_ONLY ? '?originName=[$eq][meditor]' : '';
    var defaultModelGroup = {
      uuiModelName: getUuiModelName(params.model),
      meditorModelNames: [params.model]
    };
    var modelGroup = _.find(MEDITOR_MODEL_GROUPS, function(g) {
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
            return requests({url: meta.UUI_APP_URL + '/api/users/me', headers: UUI_HEADERS, json: true, jar: meta.cookiejar, gzip: true});
        })
        .then(res => {
            console.log('Logged in into UUI as', res.uid, 'with roles for ' + meta.params.model + ': ', _.get(res, 'roles.' + meta.uuiModelName, []));
            // Acquire UUI CSRF token
            return requests({url: meta.UUI_APP_URL + '/api/csrf-token', headers: UUI_HEADERS, json: true, jar: meta.cookiejar, gzip: true});
        })
        .then(res => {
            UUI_HEADERS['x-csrf-token'] = res.csrfToken;
            return requests({url: meta.UUI_APP_URL + '/api/' + meta.uuiModelName + contentSelectorQuery, headers: UUI_HEADERS, json: true, jar: meta.cookiejar, gzip: true});
        })
        .then(res => res.data || [])
        .then(res => {
            // Compute unique identifiers for each of the meditor documents
            // for each of the target model and target this.state
            // After that, flatten the array of id arrays
            var meditorIds = [].concat(...Object.values(meta.meditorModelData).map(modelData => modelData.meditorDocs.map(doc => {return getDocumentUid(modelData, doc)})));
            // Compute document ids that currently reside in UUI
            meta.uuiIds = res.map(doc => {return doc.originData});
            // Compute and schedule items to remove from UUI (uui ids that are in uui, but not in meditor)
            return res.reduce((promiseChain, uuiDoc) => {
                return promiseChain.then(chainResults => 
                    ((meditorIds.indexOf(uuiDoc.originData) === -1) ? removeDocument(meta, uuiDoc) : Promise.resolve())
                        .then(currentResult => [ ...chainResults, currentResult ] )
                );
            }, Promise.resolve([]));
        })
        .then(res => {
            // Compute and schedule items to add to UUI (umeditor ids that are in meditor, but not uui)
            // Do this by iterating through each of the target models and pushing documents from that model
            return Object.keys(meta.meditorModelData).reduce((promiseChain, model) => {
              return promiseChain.then(chainResults => 
                  (pushModelDocuments(meta, model))
                      .then(currentResult => [ ...chainResults, currentResult ] )
              );
            }, Promise.resolve([]));
        })
        .then(res => {})
        .then(res => (meta.dbo.close()))
        .catch(err => {
        try {meta.dbo.close()} catch (e) {};
        console.error(err.status || err.statusCode, err.message || 'Unknown error');
        return Promise.reject({status: err.status || err.statusCode, message: err.message || 'Unknown error'});
        });
};

module.exports.processQueueItem = function(data) {
    return SYNC_TARGETS.reduce((promiseChain, syncTarget) => {
        return promiseChain.then(chainResults => 
            (syncItems(syncTarget, data))
                .then(currentResult => [ ...chainResults, currentResult ] )
        );
    }, Promise.resolve([]));
};
