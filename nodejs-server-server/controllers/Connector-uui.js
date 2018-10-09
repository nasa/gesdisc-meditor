'use strict';

var _ = require('lodash');
var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var DbName = "meditor";
var mongo = require('mongodb');
var requests = require('request-promise-native');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;

var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var DbName = "meditor";
var fs = require('fs');

const DEBUG_URS_LOGIN = false;

// Try to load up environment config if not loaded already
if (!!process.env.MEDITOR_ENV_FILE_PATH) {
  try {
    require('dotenv').config({path: process.env.MEDITOR_ENV_FILE_PATH});
  } catch (e) {
    console.log('WARNING: Failed to load authorization info');
  }
}

var UUI_CLIENT_ID = 'C_kKX7TXHiCUqzt352ZwTQ';
var UUI_LOCATION='https://dev.gesdisc.eosdis.nasa.gov/uui';
var UUI_HOST='dev.gesdisc.eosdis.nasa.gov'

UUI_LOCATION = UUI_LOCATION.replace(/\/+$/, '');

var URS_OAUTH_URL = 'https://urs.earthdata.nasa.gov/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(UUI_LOCATION) + '/login/callback&client_id=' + UUI_CLIENT_ID;
var URS_LOGIN_URL = 'https://urs.earthdata.nasa.gov/login';

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
    // 'Referer': 'https://urs.earthdata.nasa.gov/oauth/authorize?response_type=code&redirect_uri=' + encodeURIComponent(UUI_LOCATION) + '%2Flogin%2Fcallback&client_id=' + UUI_CLIENT_ID,
    // 'Accept-Language': 'en-US,en;q=0.9'
}

var UUI_HEADERS = {
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept': 'application/json, text/plain, */*',
    'Content-Type': 'application/json;charset=utf-8'
    //'Pragma': 'no-cache',
    // 'Accept-Language': 'en-US,en;q=0.9',
    // 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.170 Safari/537.36',
    //'Referer': UUI_LOCATION + '/',
    //'DNT': '1',
    // 'Connection': 'keep-alive',
    // 'Cache-Control': 'no-cache'
}

// Steps:

// A. Authentication into UUI using URS
// 0. Load up CMR credentials from a file into environment.
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
// 5. Push missing items from delta_missing to UUI
// 6. Remove extraneous items from delta_extraneous from UUI

// Can be used to debug URS redirect login chain
if (DEBUG_URS_LOGIN) {
    require('request-debug')(requests, function(eventType, eventData) {
        console.log(eventType, eventData.uri, eventData.method);
        console.log(eventData.headers);
        if (eventType === 'request') console.log(eventData.body);
        console.log('\n\n\n\n--------------------------------\n\n\n\n');
    });
}

module.exports.syncItems = function test () {
  var that = {params: {model: 'Alerts'}, titleProperty: 'abstract'};
  var cookiejar = requests.jar();
  var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];
  var query = [
    {$addFields: {'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}}}, // Find last state
    {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
    {$group: {_id: '$' + that.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
    {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
    {$match: {'x-meditor.state': {$in: ['Published']}}}, // Filter states based on the role's source states
  ];
  return MongoClient.connect(MongoUrl)
    .then(res => {
      that.dbo = res;
      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .aggregate(query)
    //     .map(function(doc) {
    //       var res = {"title": doc[that.titleProperty]};
    //       res["x-meditor"] = _.pickBy(doc['x-meditor'], function(value, key) {return xmeditorProperties.indexOf(key) !== -1;});
    //       if ('state' in res["x-meditor"] && !res["x-meditor"].state) res["x-meditor"].state = 'Unspecified';
    //       return res;
    //   })
      .toArray();
    })
    .then(res => {
        that.meditorDocs = res;
        // Acquire URS CSRF token
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
                'username': process.env.CMR_USER,
                'password': process.env.CMR_PASSWORD,
                'client_id': UUI_CLIENT_ID,
                'redirect_uri': UUI_LOCATION + '/login/callback',
                'response_type': 'code',
                'state': null,
                'stay_in': 1,
                'commit': 'Log+in'
            }
        });
    })
    .then(res => {
        // Verify we logged in - request user profile info
        return requests({url: UUI_LOCATION + '/api/users/me', headers: UUI_HEADERS, json: true, jar: cookiejar, gzip: true});
    })
    .then(res => {
        console.log('Logged in into UUI as', res.uid, 'with roles for ' + that.params.model + ': ', _.get(res, 'roles.' + that.params.model.toLowerCase(), []));
        // Acquire UUI CSRF token
        return requests({url: UUI_LOCATION + '/api/csrf-token', headers: UUI_HEADERS, json: true, jar: cookiejar, gzip: true});
    })
    .then(res => {
        UUI_HEADERS['x-csrf-token'] = res.csrfToken;
        return requests({url: UUI_LOCATION + '/api/alerts?published=[$eq][true]', headers: UUI_HEADERS, json: true, jar: cookiejar, gzip: true});
    })
    .then(res => res.data)
    .then(res => {
        var postDefers = [];
        that.uuiDocs = res.reduce(function (accumulator, currentValue) {
            accumulator[currentValue.title] = _.pickBy(currentValue, function(value, key) {return ['title', 'lastPublished'].indexOf(key) !==  -1;});
            return accumulator;
        }, {});

        // console.log(that.uuiDocs);
        // console.log(that.meditorDocs);
        that.meditorDocs.forEach(function(meditorDoc) {
            if (!(meditorDoc[that.titleProperty] in that.uuiDocs)) {
                console.log('Pushing [' + meditorDoc[that.titleProperty] + '] of type [' + that.params.model + '] to UUI');
                postDefers.push(
                    requests.post({
                        url: UUI_LOCATION + '/api/alerts',
                        headers: UUI_HEADERS,
                        jar: cookiejar, 
                        followAllRedirects: true,
                        json: true,
                        gzip: true,
                        body: {
                            "severity":meditorDoc.severity,
                            "title":meditorDoc[that.titleProperty],
                            "body":meditorDoc.body,
                            "start":meditorDoc.start,
                            "expiration":meditorDoc.expiration,
                            "lastPublished": meditorDoc['x-meditor'].modifiedOn,
                            "published":true,
                            "author": meditorDoc['x-meditor'].modifiedBy
                        }
                    })
                );
            }
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


//module.exports.test();