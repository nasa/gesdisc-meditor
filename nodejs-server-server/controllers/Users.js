'use strict';
var _ = require('lodash');
var querystring = require('querystring');
var https = require('https');
var cookieParser = require('cookie-parser');
var helmet = require('helmet');
var passport = require('passport');
var session = require('express-session');
var SessionStore = require('connect-mongodb-session')(session);
var OAuth2Strategy = require('passport-oauth2').Strategy;
var csrf = require('csurf');
var utils = require('../utils/writer.js');
var swaggerTools = require('swagger-tools');

var MongoClient = require('mongodb').MongoClient;
var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var DbName = "meditor";

var ENV_CONFIG = {
  APP_URL: process.env.APP_UR || 'http://localhost:8081'
};

var AUTH_CONFIG = {
  HOST: process.env.AUTH_HOST,
  CLIENT_ID: process.env.AUTH_CLIENT_ID,
  CLIENT_SECRET: process.env.AUTH_CLIENT_SECRET
};

var AUTH_PROTOCOL = 'https:';
var URS_FIELDS = ['uid', 'emailAddress', 'firstName', 'lastName', 'middleInitial', 'studyArea'];

// Earthdata's OAuth2 slightly deviates from what's supported in the current oauth module,
// so let's overwrite it
// Credit: most of code in this function belongs to https://github.com/ciaranj/node-oauth
require('oauth').OAuth2.prototype.getOAuthAccessToken = function(code, params, callback) {
  var codeParam;
  var postData;
  var postHeaders;
  var results;
  var accessToken;
  var refreshToken;
  params = params || {};
  // Start of UUI customization
  if (!('Authorization' in this._customHeaders)) {
    params.client_id = this._clientId;
    params.client_secret = this._clientSecret;
  }
  // End of UUI customization
  codeParam = (params.grant_type === 'refresh_token') ? 'refresh_token' : 'code';
  params[codeParam] = code;
  postData = querystring.stringify(params);
  postHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };
  this._request('POST', this._getAccessTokenUrl(), postHeaders, postData, null, function(error, data, response) { // eslint-disable-line no-unused-vars
    if (error) {
      callback(error);
    } else {
      try {
        results = JSON.parse(data);
      } catch (e) {
        results = querystring.parse(data);
      }
      accessToken = results.access_token;
      refreshToken = results.refresh_token;
      delete results.refresh_token;
      callback(null, accessToken, refreshToken, results); // callback results =-=
    }
  });
};

passport.serializeUser(function(user, done) {
  // Replace/map descriptive roles with resource-specific access rights consumed by UI and backend
  user.roles = {}; // commons.getUserResourceRoles(user.roles);
  done(null, JSON.stringify(user));
});

passport.deserializeUser(function(user, done) {
  user = JSON.parse(user);
  user.lastAccessed = _.now();
  MongoClient.connect(MongoUrl, function(err, db) {
    if (err) {
      console.log(err);
      throw err;
    }
    var dbo = db.db(DbName);
    dbo.collection("Users").findOneAndUpdate({
      _id: user._id
    }, {
      $set: {
        lastAccessed: user.lastAccessed
      }
    }, function(err, res) {
      if (err) {
        console.log(err);
        throw err;
      }
      db.close();
    });
  });
  done(null, user);
});

passport.use(new OAuth2Strategy({
  authorizationURL: AUTH_PROTOCOL + '//' + AUTH_CONFIG.HOST + '/oauth/authorize',
  tokenURL: AUTH_PROTOCOL + '//' + AUTH_CONFIG.HOST + '/oauth/token',
  clientID: AUTH_CONFIG.CLIENT_ID,
  clientSecret: AUTH_CONFIG.CLIENT_SECRET,
  callbackURL: ENV_CONFIG.APP_URL + '/meditor/api/login',
  customHeaders: {
    Authorization: new Buffer(AUTH_CONFIG.CLIENT_ID + ':' + AUTH_CONFIG.CLIENT_SECRET).toString('base64')
  }
}, function(accessToken, refreshToken, authResp, profile, cb) {
  https.get({
    protocol: AUTH_PROTOCOL,
    hostname: AUTH_CONFIG.HOST,
    path: authResp.endpoint,
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  }, function(res) {
    var resp = '';

    res.on('data', function(data) {
      resp += data;
    });

    res.on('end', function() {
      var updatedModel = {
        lastAccessed: _.now()
      };
      try {
        resp = JSON.parse(resp);

        _.forEach(URS_FIELDS, function(field) {
          updatedModel[field] = resp[_.snakeCase(field)];
        });
        MongoClient.connect(MongoUrl, function(err, db) {
          if (err) {
            cb(err);
            throw err;
          }
          var dbo = db.db(DbName);
          dbo.collection("Users").findOne({
            uid: resp.uid
          }).then(function(model) {
            if (_.isNil(model)) {
              updatedModel.created = _.now();
              // model = new User(updatedModel);
              model = updatedModel;
            }
            return dbo.collection("Users").findOneAndUpdate({
              uid: resp.uid
            }, {
              $set: model
            }, {
              upsert: true
            });
          }).then(function(model) {
            cb(null, model.value);
          }).catch(function(e) {
            cb(e);
          }).finally(function() {
            db.close();
          });
        });
      } catch (e) {
        cb(e);
      }
    });
  }).on('error', function(err) {
    cb(err);
  });
}));

// Exported method to login
module.exports.login = function login(req, res, next) {
  passport.authenticate('oauth2',
    function(req1, res1) {
      req.logIn(res1, function(err) {
        if (err) utils.writeJson(res, {
          code: 500,
          message: err
        }, 500);
      });
      res.writeHead(301, {
        Location: ENV_CONFIG.APP_URL + '/docs/'
      });
      res.end();
    }
  )(req, res, next);
};

// Exported method to logout
module.exports.logout = function logout(req, res, next) {
  var cookie = req.cookies;
  var outCookies = [];
  req.session.destroy();
  // Destroy all old cookies
  for (var prop in cookie) {
    if (!cookie.hasOwnProperty(prop)) continue;
    outCookies.push(prop + '=;expires:' + (new Date(0)).toUTCString() + ';');
  };
  if (outCookies.length > 0) res.setHeader('Set-Cookie', outCookies);
  res.writeHead(301, {
    Location: ENV_CONFIG.APP_URL + '/docs/'
  });
  res.end();
};

// Exported method to get user info
module.exports.getMe = function getMe(req, res, next) {
  if (_.isEmpty(req.user)) {
    utils.writeJson(res, {}, 200);
  } else {
    utils.writeJson(res, req.user, 200);
  }
};

// Exported method to get user info
module.exports.getCsrfToken = function getCsrfToken(req, res, next) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Surrogate-Control', 'max-age=0');
  res.setHeader('Expires', '0');
  utils.writeJson(res, {
    csrfToken: req.csrfToken()
  }, 200);
};

module.exports.init = function(app) {
  app.use(helmet({noCache: true}));
  app.use(cookieParser());
  app.use(session({
    name: _(20).range().shuffle().value().join(''),
    secret: Date.now().toString(32) + Math.random().toString(32),
    resave: false,
    /* do not automatically write to the session store, even if the session was never modified during the request */
    saveUninitialized: true,
    /*   force a session that is "uninitialized" to be saved to the store
     *  a session is uninitialized when it is new but not modified
     *  https://www.npmjs.com/package/express-session
     */
    store: new SessionStore({
      uri: _.trimEnd(MongoUrl, '/') + '/' + DbName,
      collection: 'Sessions'
    })
  }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Protect all PUT requests with cookie-based csrf
  app.use('/meditor/api/', csrf({cookie: true}));
};
