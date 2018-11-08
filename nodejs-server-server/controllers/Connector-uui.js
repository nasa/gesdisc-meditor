'use strict';
var _ = require('lodash');
var mongo = require('mongodb');
var requests = require('request-promise-native');
var MongoClient = mongo.MongoClient;
var mUtils = require('./lib/meditor-utils.js');

const DEBUG_URS_LOGIN = false;

// Try to load up environment config if not loaded already
if (!!process.env.MEDITOR_ENV_FILE_PATH) {
  try {
    require('dotenv').config({path: process.env.MEDITOR_ENV_FILE_PATH});
  } catch (e) {
    console.log('WARNING: Failed to load authorization info');
  }
}

var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var DbName = "meditor";
var UUI_AUTH_CLIENT_ID = process.env.UUI_AUTH_CLIENT_ID;
var UUI_APP_URL =  (process.env.UUI_APP_URL || 'http://localhost:9000').replace(/\/+$/, '');
var URS_USER = process.env.URS_USER;
var URS_PASSWORD = process.env.URS_PASSWORD;

var URS_BASE_URL = 'https://urs.earthdata.nasa.gov';
var URS_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',  
    'Accept-Encoding': 'gzip, deflate, br',
    'Content-Type': 'application/x-www-form-urlencoded'
    // 'Host': 'urs.earthdata.nasa.gov',
    //'Connection': 'keep-alive',
    // 'Content-Length': 336,
    // 'Pragma': 'no-cache',
    // 'Cache-Control': 'no-cache',
    // 'Origin': 'https://urs.earthdata.nasa.gov',
    // 'Upgrade-Insecure-Requests': 1,
    // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    // 'Referer': 'https://urs.earthdata.nasa.gov/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(UUI_APP_URL) + '%2Flogin%2Fcallback&client_id=' + UUI_AUTH_CLIENT_ID,
    // 'Accept-Language': 'en-US,en;q=0.9'
}

var UUI_HEADERS = {
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
function getDocumentUid (metadata, meditorDoc) {
    return encodeURIComponent(_.get(meditorDoc, metadata.titleProperty)) + '_' + meditorDoc['x-meditor'].modifiedOn;
}

function getUuiModelName (model) {
    if (model == 'Image') return 'images'; // Hack until we fix the name of the images model
    return model.toLowerCase();
}

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

module.exports.syncItems = function syncItems (params) {
  var that = {params: params};
  var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];
  
  return MongoClient.connect(MongoUrl)
    .then(res => {
        that.dbo = res;
        return that.dbo
            .db(DbName)
            .collection("Models")
            .find({name:params.model})
            .project({_id:0})
            .sort({"x-meditor.modifiedOn":-1})
            .limit(1)
            .toArray();
    })
    .then(res => {
        var meditorContentQuery; 
        that.titleProperty = res[0].titleProperty || 'title';
        meditorContentQuery = [
            {$addFields: {'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}}}, // Find last state
            {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
            {$group: {_id: '$' + that.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
            {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
            {$match: {'x-meditor.state': {$in: ['Published']}}}, // Filter states based on the role's source states
        ];
        return that.dbo
            .db(DbName)
            .collection(that.params.model)
            .aggregate(meditorContentQuery)
            .toArray();
    })
    .then(res => {
        that.meditorDocs = res;
        return loginIntoUrs({
            user: URS_USER,
            password: URS_PASSWORD,
            redirectUri:UUI_APP_URL + '/login/callback',
            clientId: UUI_AUTH_CLIENT_ID
        });
    })
    .then(res => {
        that.cookiejar = res;
        // Verify we logged in - request user profile info
        return requests({url: UUI_APP_URL + '/api/users/me', headers: UUI_HEADERS, json: true, jar: that.cookiejar, gzip: true});
    })
    .then(res => {
        console.log('Logged in into UUI as', res.uid, 'with roles for ' + that.params.model + ': ', _.get(res, 'roles.' + getUuiModelName(that.params.model), []));
        // Acquire UUI CSRF token
        return requests({url: UUI_APP_URL + '/api/csrf-token', headers: UUI_HEADERS, json: true, jar: that.cookiejar, gzip: true});
    })
    .then(res => {
        UUI_HEADERS['x-csrf-token'] = res.csrfToken;
        return requests({url: UUI_APP_URL + '/api/' + getUuiModelName(that.params.model) + '?originName=[$eq][meditor]', headers: UUI_HEADERS, json: true, jar: that.cookiejar, gzip: true});
    })
    .then(res => res.data)
    .then(res => {
        var postDefers = [];
        var meditorIds = that.meditorDocs.map(doc => {return getDocumentUid(that, doc)});
        var uuiIds = res.map(doc => {return doc.originData});

        // Compute and schedule items to unpublish
        res.forEach(function(uuiDoc) {
            if (meditorIds.indexOf(uuiDoc.originData) === -1) {
                console.log('Removing [' + uuiDoc.title + '] of type [' + that.params.model + '] from UUI');
                postDefers.push(
                    requests.delete({
                        url: UUI_APP_URL + '/api/' + getUuiModelName(that.params.model) + '/' + encodeURIComponent(uuiDoc.title),
                        headers: UUI_HEADERS,
                        jar: that.cookiejar, 
                        followAllRedirects: true
                    })
                );
            }
        });

        // Compute and schedule items to publish
        that.meditorDocs.forEach(function(mDoc) {
            postDefers.push(mUtils.assembleDocument(that.dbo.db(DbName), mDoc).then(function(meditorDoc) {
                var docId = getDocumentUid(that, meditorDoc);
                var postedModel = {};
                var image;
                var imageType;
                var postRequest;
                var uui_headers = _.cloneDeep(UUI_HEADERS);
                if (uuiIds.indexOf(docId) === -1) {
                    console.log('Pushing [' + _.get(meditorDoc, that.titleProperty) + '] of type [' + that.params.model + '] to UUI');
                    postedModel = _.cloneDeep(meditorDoc);
                    _.assign(postedModel, {
                        'title': _.get(meditorDoc, that.titleProperty),
                        'published': true,
                        'originName': 'meditor',
                        'originData': getDocumentUid(that, meditorDoc)
                    });
                    postRequest = {
                        url: UUI_APP_URL + '/api/' + getUuiModelName(that.params.model),
                        headers: uui_headers,
                        jar: that.cookiejar, 
                        followAllRedirects: true,
                        gzip: true
                    }
                    if ('image' in postedModel) {
                        uui_headers['Content-Type'] = 'multipart/form-data';
                        // Image is stored in Base64 like this "image" : "data:image/png;base64,iVBORw0KGgoAA..."
                        image = postedModel.image.split(',');
                        image[0] = image[0].replace(/[:;]/g, ',').split(',');
                        delete postedModel.image; // Remove image from request body (we will add it later)
                        // Convert all keys to string as required by the form-encoded transport
                        Object.keys(postedModel).forEach(function(key) {postedModel[key] = _.trim(JSON.stringify(postedModel[key]), '"') ;});
                        // Add image binary
                        postedModel.fileRef = {
                            value: new Buffer(image[1], 'base64'),
                            options: {
                                filename: _.get(meditorDoc, that.titleProperty),
                                contentType: image[0][1]
                            }
                        }
                        postedModel.abstract = postedModel.abstract || postedModel.description; // Hack until we fix the images model
                        
                        postRequest.formData = postedModel;
                        postRequest.preambleCRLF = true;
                        postRequest.postambleCRLF = true;
                    } else {
                        postRequest.json = true;
                        postRequest.body = postedModel;
                    }
                    return requests.post(postRequest);
                }
            }));
        });
        return Promise.all(postDefers);
    })
    .then(res => {})
    .then(res => (that.dbo.close()))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      console.log(err.status || err.statusCode, err.message || 'Unknown error');
      return Promise.reject({status: err.status || err.statusCode, message: err.message || 'Unknown error'});
    });
};
