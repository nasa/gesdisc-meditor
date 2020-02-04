'use strict';
var _ = require('lodash');
var requests = require('request-promise-native');
var uuiConfig = require('./uui-publisher-config');
var ursLogin = require('./urs-login');

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
if (uuiConfig.DEBUG_URS_LOGIN) {
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

function getDocumentTimestamp(meditorDoc) {
  return (_.get(meditorDoc, 'x-meditor.publishedOn') || _.get(meditorDoc, 'x-meditor.modifiedOn'));
}

function getTitle(meditorModel, meditorDoc) {
  var titleProperty = meditorModel.titleProperty || 'title';
  return _.get(meditorDoc, titleProperty)
};

// Returns a unique identifier for a given mEdiotor document
// Used for provenance when writing a document to UUI
function getDocumentUid(meditorModel, meditorDoc) {
  return encodeURIComponent(getTitle(meditorModel, meditorDoc) + '_' + getDocumentTimestamp(meditorDoc));
}

// Returns an additional document metadata to be sent to UUI
function getDocumentMetadata(meditorDoc) {
  var metadata = {
    authorId: _.get(meditorDoc, "x-meditor.modifiedBy"),
    lastPublished: getDocumentTimestamp(meditorDoc)
  };
  return metadata;
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

// Pushes a mEditor document into UUI
var putDocument = function(params, meditorModel, meditorDoc) {
  // targetUrl is where this pushed document will be available in UUI
  var targetUrl = params.connection.uuiUrl + '/information/' + params.uuiModelName + '?' + 'title=' + encodeURIComponent(getTitle(meditorModel, meditorDoc));
  if (uuiConfig.DEBUG_MODE) console.log('Publishing [' + getTitle(meditorModel, meditorDoc) + '] of type [' + params.meditorModelName + '] to UUI [' + params.uuiModelName + '] (' + params.connection.baseline + ')', isDryRun() ? '(Dry Run Mode)' : '');
  return Promise.resolve()
    .then(function() {
      var postedModel = _.cloneDeep(meditorDoc);
      var postRequest;
      _.assign(postedModel, {
        'title': getTitle(meditorModel, meditorDoc),
        'published': true,
        'lastPublished': _.get(meditorDoc, 'x-meditor.publishedOn') || _.get(meditorDoc, 'x-meditor.modifiedOn'),
        'updated': _.get(meditorDoc, 'x-meditor.modifiedOn'),
        'created': _.get(meditorDoc, 'x-meditor.createdOn') || _.get(meditorDoc, 'x-meditor.modifiedOn'),
        'originName': 'meditor',
        'originData': getDocumentUid(meditorModel, meditorDoc),
        'originMeta': getDocumentMetadata(meditorDoc)
      });
      if (uuiConfig.DEBUG_MODE) console.log('Pushing doc ID from UUI:', postedModel.originData);
      postRequest = {
        url: params.connection.uuiUrl + '/api/' + params.uuiModelName,
        headers: params.connection.headers,
        jar: params.connection.cookiejar,
        followAllRedirects: true,
        gzip: true,
        json: true,
        body: postedModel
      }
      return requests.post(postRequest)
    })
    .then(res => {
      if (uuiConfig.DEBUG_MODE) console.log(res);
      return {
        url: targetUrl,
        time: (new Date()).getTime()
      }
    });
}

// Removes a document with a given title from UUI
var deleteDocument = function(params, meditorModel, uuiDoc) {
  // targetUrl is a URL of a UUI document that is being removed
  var targetUrl = params.connection.uuiUrl + '/information/' + params.uuiModelName + '?' + 'title=' + encodeURIComponent(uuiDoc.title);
  return Promise.resolve()
    .then(res => {
      if (uuiConfig.DEBUG_MODE) console.log('Removing [' + uuiDoc.title + '] of type [' + params.uuiModelName + '] from UUI [' + params.uuiModelName + '] (' + params.connection.baseline + ')', isDryRun() ? '(Dry Run Mode)' : '');
      if (uuiConfig.DEBUG_MODE) console.log('Removing doc ID from UUI:', uuiDoc.originData);
      if (isDryRun()) return resolve();
      return requests.delete({
        url: params.connection.uuiUrl + '/api/' + params.uuiModelName + '/' + encodeURIComponent(encodeURIComponent(uuiDoc.title)),
        headers: params.connection.headers,
        jar: params.connection.cookiejar,
        followAllRedirects: true
      });
    })
    .then(res => {
      return {url: targetUrl};
    });
};

var uuiActions = {
  put: {
    handle: putDocument,
    actionLabel: 'put',
    resultLabel: 'published to'
  },
  delete: {
    handle: deleteDocument,
    actionLabel: 'Delete',
    resultLabel: 'removed from'
  }
}

// Pushes all items from a mEditor model specified in params
// into UUI and purges from UUI items that are no longer
// present in mEditor. Every item pushed into UUI is marked
// as 'source=meditor'. Consequently, sync removes and updates
// only those items in UUI that are markes as 'source=meditor'.
// All other items in UUI are essentially invisible to this code.
function actOnDocument(params, action, meditorModel, meditorDocument) {
  params = _.cloneDeep(params);
  return Promise.resolve()
    .then(res => {
      return ursLogin.login({
        user: uuiConfig.URS_USER,
        password: uuiConfig.URS_PASSWORD,
        redirectUri: params.connection.uuiUrl + '/login/callback',
        clientId: uuiConfig.UUI_AUTH_CLIENT_ID,
        baseUrl: uuiConfig.URS_BASE_URL,
        headers: uuiConfig.URS_HEADERS
      });
    })
    .then(res => {
      params.connection.cookiejar = res;
      // Verify we logged in - request user profile info
      let requestParams = {
        url: params.connection.uuiUrl + '/api/users/me',
        headers: params.connection.headers,
        json: true,
        jar: params.connection.cookiejar,
        gzip: true
      }
      return requests(requestParams);
    })
    .then(res => {
      if (uuiConfig.DEBUG_MODE) console.log('Logged in into UUI as', res.uid, 'with roles for ' + params.meditorModelName + ': ', _.get(res, 'roles.' + params.uuiModelName, []));
      // Acquire UUI CSRF token
      return requests({
        url: params.connection.uuiUrl + '/api/csrf-token',
        headers: params.connection.headers,
        json: true,
        jar: params.connection.cookiejar,
        gzip: true
      });
    })
    .then(res => {
      params.connection.headers['x-csrf-token'] = res.csrfToken;
      if (isDryRun()) {
        if (uuiConfig.DEBUG_MODE) console.error('UUI sync is disabled. Running in Dry Run mode - changes will NOT be propagated to UUI. Set PUBLISH_TO_UUI to true to enable sync.');
        return Promise.reject({status: 304, message: "Dry Run mode, no changes have been pushed to uui"});
      }
      return uuiActions[action].handle(params, meditorModel, meditorDocument);
    })
    .then(res => {
      _.assign(res, {
        statusCode: 200,
        message: 'Document was sucessfully ' + uuiActions[action].resultLabel + ' UUI-' + params.connection.baseline
      });
      return Promise.resolve(res);
    })
    .catch(err => {
      if (uuiConfig.DEBUG_MODE) console.error(err.status || err.statusCode, err.message || 'Unknown error');
      return Promise.reject({
        statusCode: err.status || err.statusCode || 500,
        message: err.message || 'Unknown error'
      });
    });
};

module.exports.processMessage = function(meditorModelName, meditorModel, document, documentState) {
  var modelGroup = _.find(uuiConfig.MEDITOR_MODEL_GROUPS, function (g) {
    return g.meditorModelNames.indexOf(meditorModelName) !== -1
  });
  var syncTarget = _.find(uuiConfig.SYNC_TARGETS, function (destination) {
    return destination.states.indexOf(documentState) !== -1
  });
  var params;
  if (!syncTarget)  return Promise.reject({
    message: 'Model not supported',
    statusCode: 415
  });
  params = {
    connection: {
      uuiUrl: syncTarget.url.replace(/\/+$/, ''),
      baseline: syncTarget.baseline,
      headers: _.cloneDeep(uuiConfig.UUI_HEADERS)
    },
    meditorModelName: meditorModelName,
    uuiModelName: _.get(modelGroup || {}, 'uuiModelName', getUuiModelName(meditorModelName))
  };
  // Ignore models not supported in UUI
  if (uuiConfig.PUBLISHABLE_MODELS.indexOf(meditorModelName) === -1) return Promise.reject({
    message: 'Model not supported',
    statusCode: 406
  });
  if (!uuiActions[syncTarget.action]) return Promise.reject({
    message: 'Configuration error. Action required for the state not found in the action registry.',
    statusCode: 500
  });
  // Go ahead and process the document
  return actOnDocument(params, syncTarget.action, meditorModel, document)
};
