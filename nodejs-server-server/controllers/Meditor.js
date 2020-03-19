'use strict';

var _ = require('lodash');
var utils = require('../utils/writer');
var Default = require('../service/DefaultService');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;
var jsonpath = require('jsonpath');
var macros = require('./Macros');
var mUtils = require('./lib/meditor-utils');
var mFile = require('./lib/meditor-mongo-file');

var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var DbName = "meditor";

var SHARED_MODELS = ['Workflows', 'Users', 'Models'];


// ======================== Register fetch functions with Macro.fetch ==============
macros.registerFetchers(require('./lib/fetchers').getFetchers());

// ======================== Common helper functions ================================

// Wrapper to parse JSON giving v8 a chance to optimize code
function safelyParseJSON (jsonStr) {
  var jsonObj;
  try {
    jsonObj = JSON.parse(jsonStr)
  } catch (err) {
    throw err;
  }
  return jsonObj;
}

// Converts Swagger parameter notation into a plain dictionary
function getSwaggerParams(request) {
  var params = {};
  if (_.get(request, 'swagger.params', null) === null) return params; 
  for ( var property in request.swagger.params ) {
    params[property] = request.swagger.params[property].value;
  }
  return params;
}

function handleResponse(response, res, defaultStatus, defaultMessage) {
  var status = res.status || defaultStatus;
  var result = res;
  if (_.isNil(res)) result = defaultMessage;
  if (_.isObject(res) && _.get(res, 'message', null) !== null) result = res.message;
  if (_.isString(result)) {
    result = {code: status, description: result};
  };
  utils.writeJson(response, result, status);
}

function handleError(response, err) {
  console.log('Error: ', err);
  handleResponse(response, err, 500, 'Unknown error');
};

function handleSuccess(response, res) {
  handleResponse(response, res, 200, 'Success');
};

// Builds aggregation pipeline query for a given model (common starting point for most API functions)
function getDocumentAggregationQuery(meta) {
  var searchQuery = {};
  var query;
  var defaultStateName = "Unspecified";
  var defaultState = {target: defaultStateName, source: defaultStateName, modifiedBy: 'Unknown', modifiedOn: (new Date()).toISOString()};
  var returnableStates = _.concat(meta.sourceStates, ["Unspecified"]);
  if (meta.params.model) {
    if (SHARED_MODELS.indexOf(meta.params.model) !== -1) returnableStates = _.concat(returnableStates, meta.readyNodes); // Return ready nodes for shared models
    // need a second match
    // $not: {$and: {'x-meditor.modifiedBy': meta.user.uid, 'x-meditor.state': {$in: exclusiveStates}}}
    // if (!_.isEmpty(meta.user.uid)) filterQuery['x-meditor.modifiedBy'] = {$ne: meta.user.uid};
    query = [
      {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
      {$group: {_id: '$' + meta.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
      {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
      {$addFields: {'x-meditor.states': { $ifNull: [ "$x-meditor.states", [defaultState] ] }}}, // Add default state on docs with no states
      {$addFields: {'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}}}, // Find last state
      {$addFields: {'banTransitions': {"$eq" : [{$cond: {if: {$in: ['$x-meditor.state', meta.exclusiveStates]}, then: meta.user.uid, else: '' }}, {$arrayElemAt: [ "$x-meditor.states.modifiedBy", -1 ]}  ]}}}, // This computes whether a user can transition the edge if he is the modifiedBy of the current state 
     
      //{$match: {'x-meditor.state': {$in: returnableStates}, 'bannedTransition': false}}, // Filter states based on the role's source states
      //{$match: {'banTransitions': false}}, // Filter states based on the role's source states
    ];
  }
  // Build up search query if search params are available
  if ('title' in meta.params) searchQuery[meta.titleProperty] =  meta.params.title;
  if ('version' in  meta.params && meta.params.version !== 'latest') searchQuery['x-meditor.modifiedOn'] = meta.params.version;
  if (!_.isEmpty(searchQuery)) query.unshift({$match: searchQuery}); // Push search query into the top of the chain
  return query;
}

// Collects various metadata about request and model - to be
// used in queries and what not
function getDocumentModelMetadata(dbo, request, paramsExtra) {
  // This is a convenience function that returns a number of
  // parameters needed to work with documents:
  // - request parameters
  // - all user roles
  // - model-specific user roles
  // - model
  // - workflow
  // - title property (retrieved from model)
  // - source states available to the user
  // - target states available to the user
  // Note: if set, paramsExtra are super-imposed on top of swagger params
  var that = {
    params: _.assign(getSwaggerParams(request), paramsExtra),
    roles: _.get(request, 'user.roles', {}),
    dbo: dbo,
    user: request.user || {},
    exclusiveStates: ['Under Review', 'Approved']
  };
  // TODO Useful for dubugging
  // that.roles = [ 
  //   { model: 'Alerts', role: 'Author' },
  //   { model: 'Alerts', role: 'Reviewer' } ];
  that.modelName = that.params.model;
  that.modelRoles = _(that.roles).filter({model: that.params.model}).map('role').value();
  return getModelContent(that.params.model) // The model should be pre-filled with Macro subs
    .then(res => {
      if (_.isEmpty(res)) throw {message: 'Model for ' + that.params.model + ' not found', status: 400};
      that.model = res;
      that.titleProperty = that.model['titleProperty'] || 'title';
    })
    .then(res => {
      return that.dbo
        .db(DbName)
        .collection('Workflows')
        .find({name: that.model.workflow})
        .sort({'x-meditor.modifiedOn': -1})
        .limit(1)
        .toArray();
    })
    .then(res => {
      if (_.isEmpty(res)) throw {message: 'Workflow for ' + that.params.model + ' not found', status: 400};
      that.workflow = res[0];
      that.readyNodes = _(that.workflow.nodes).pickBy({readyForUse: true}).map('id').value();
      that.sourceStates = _(that.workflow.edges)
        .filter(function(e) {return that.modelRoles.indexOf(e.role) !== -1;})
        .map('source').uniq().value();
      that.targetStates = _(that.workflow.edges)
        .filter(function(e) {return that.modelRoles.indexOf(e.role) !== -1;})
        .map('target').uniq().value();
        res.reduce(function (accumulator, currentValue) {
        if (currentValue.length !== 1) return accumulator;
        accumulator[currentValue[0].name] = currentValue[0].count;
        return accumulator;
      }, {});
      that.sourceToTargetStateMap = that.workflow.edges.reduce(function(collector, e) {
        if (that.modelRoles.indexOf(e.role) !== -1) {
          if (!collector[e.source]) collector[e.source] = [];
          collector[e.source].push(e.target);
        }
        return collector;
      }, {});
      return that;
    });
}

function getExtraDocumentMetadata (meta, doc) {
  var extraMeta = {'x-meditor':
    {targetStates: doc.banTransitions ? [] : _.get(meta.sourceToTargetStateMap, _.get(doc, "x-meditor.state", "Unknown"), [])}
  };
  return extraMeta;
}

// ================================= Exported API functions =========================

// Add a Model
function addModel (model) {
  model["x-meditor"]["modifiedOn"] = (new Date()).toISOString();
  model["x-meditor"]["modifiedBy"] = "anonymous";
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      dbo.collection("Models").insertOne(model, function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        var userMsg = "Inserted Model";
        db.close();
        resolve(userMsg);
      });
    });
  });
}

// Exported method to list Models
module.exports.listModels = function listModels (request, response, next) {
  var that = {};
  return MongoClient.connect(MongoUrl)
    .then(res => {
      that.dbo = res;
      return getDocumentModelMetadata(that.dbo, request, {model: 'Models'});
    })
    .then(meta => {_.assign(that, meta)})
    .then(function() {
      // Start by getting a list of models
      var properties = that.params.properties;
      var projection = {_id:0};
      if (properties === undefined) {
        properties = ["name", "description", "icon", "x-meditor", "category"];
      }
      if (!Array.isArray(properties)) properties = [properties];
      if (Array.isArray(properties)) {
        properties.forEach(function(element){
          projection[element]= '$'+element;
        });
      }
      // Get list of models ...
      return that.dbo.db(DbName)
        .collection("Models")
        .aggregate(
          [{$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
          {$group: {_id: '$name', doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
          {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
          {$project: projection}
        ])
        .toArray();
    })
    .then(function(res) {
      // Collect roles, target states, and other metadata for each model
      that.models = res;
      var defers = _.map(that.models, function(model) {
        var modelMeta = {};
        return getDocumentModelMetadata(that.dbo, {user: request.user}, {model: model.name});
      });
      return Promise.all(defers);
    })
    .then(function(modelMetas) {
      that.modelMetas = modelMetas;
      // Based on collected metadata, query each model for unique items
      // as appropriate for user's role and count the results
      return Promise.all(modelMetas.map(modelMeta => {
        var query = getDocumentAggregationQuery(modelMeta);
        query.push({$group: {_id: null, "count": { "$sum": 1 }}});
        query.push({$addFields: {name: modelMeta.modelName}});
        return that.dbo.db(DbName).collection(modelMeta.modelName).aggregate(query).toArray();
      }));
    })
    .then(function(res) {
      that.countsRoleAware = res.reduce(function (accumulator, currentValue) {
        if (currentValue.length !== 1) return accumulator;
        accumulator[currentValue[0].name] = currentValue[0].count;
        return accumulator;
      }, {});
      // Count all items regardless of the model
      return Promise.all(that.modelMetas.map(modelMeta => {
        return that.dbo.db(DbName).collection(modelMeta.modelName).aggregate([
          {$group: {_id: '$' + modelMeta.titleProperty}},
          {$group: {_id: null, "count": { "$sum": 1 }}},
          {$addFields: {name: modelMeta.modelName}}
        ]).toArray();
      }));
    })
    .then(function(res) {
      that.countsTotal = res.reduce(function (accumulator, currentValue) {
        if (currentValue.length !== 1) return accumulator;
        accumulator[currentValue[0].name] = currentValue[0].count;
        return accumulator;
      }, {});
    })
    .then(function() {
      that.models.forEach(m => {m['x-meditor'].count = that.countsRoleAware[m.name] || 0});
      that.models.forEach(m => {m['x-meditor'].countAll = that.countsTotal[m.name] || 0});
      return that.models;
    })
    .then(res => (that.dbo.close(), handleSuccess(response, res)))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      handleError(response, err);
    });
};

//Exported method to add a Model
module.exports.putModel = function putModel (req, res, next) {
  // Parse uploaded file
  var file = req.swagger.params['file'].value;
  // Ensure it is well formed JSON
  var model;
  try {
    model = safelyParseJSON(file.buffer.toString());
  } catch(err) {
    console.log(err);
    var response = {
      code:400,
      message:"Failed to parse the Model"
    };
    utils.writeJson(res, response, 400);
    return;
  }
  // TODO: validate JSON based on schema

  // Insert the new Model
  addModel(model)
  .then(function (response){
    utils.writeJson(res, {code:200, message:response}, 200);
  })
  .catch(function (response){
    utils.writeJson(res, {code:500, message: response}, 500);
  });
};

//Exported method to add a Document
module.exports.putDocument = function putDocument (request, response, next) {
  var that = {};
  // Parse uploaded file
  var file = request.swagger.params['file'].value;
  // Ensure it is well formed JSON
  var doc;
  try {
    doc = safelyParseJSON(file.buffer.toString());
    // TODO: validate JSON based on schema
  } catch(err) {
    console.log(err);
    return handleError(response, {
      status: 400,
      message: "Failed to parse the Document"
    });
  };

  return MongoClient.connect(MongoUrl)
    .then(res => {
      that.dbo = res;
      return getDocumentModelMetadata(that.dbo, request, {model: doc["x-meditor"]["model"]});
    })
    .then(meta => {_.assign(that, meta)})
    .then(function() {
      var imageStr = null;
      var imagePromise = Promise.resolve();
      var rootState = _.cloneDeep(mUtils.WORKFLOW_ROOT_EDGE);
      rootState.modifiedOn = doc["x-meditor"]["modifiedOn"];
      doc["x-meditor"]["modifiedOn"] = (new Date()).toISOString();
      doc["x-meditor"]["modifiedBy"] = request.user.uid;
      // TODO: replace with actual model init state
      doc["x-meditor"]["states"] = [rootState];
      return Promise.all([that.dbo.db(DbName).collection(doc["x-meditor"]["model"]).insertOne(doc), imagePromise]);
    })
    .then(function(savedDoc) {
      return Promise.resolve("Inserted document");
    })
    .then(res => {return mUtils.actOnDocumentChanges(that, DbName, doc);})
    .then(res => {return mUtils.addToConnectorQueue(that, DbName, 'uui', {model: doc["x-meditor"]["model"]})}) // Take an opportunity to sync with UUI    .then(res => (that.dbo.close(), handleSuccess(response, {message: "Success"})))
    .then(res => (that.dbo.close(), handleSuccess(response, {message: "Inserted document"})))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      handleError(response, err);
    });
};

// Exported method to list documents
module.exports.listDocuments = function listDocuments (request, response, next) {
  // Function - wide variables are stored here
  // 1. Get Model to learn about workflow and title field
  // 2. Find workflow to learn about states
  // 3. Find latest version of the documents according to roles
  var that = {};
  return MongoClient.connect(MongoUrl)
    .then(res => {
      that.dbo = res;
      return getDocumentModelMetadata(that.dbo, request);
    })
    .then(meta => {_.assign(that, meta)})
    .then(function() {
      var xmeditorProperties = ["modifiedOn", "modifiedBy", "state", "targetStates"];
      var query = getDocumentAggregationQuery(that);
      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .aggregate(query)
        .map(function(doc) {
          var res = {"title": _.get(doc, that.titleProperty)};
          res["x-meditor"] = _.pickBy(doc['x-meditor'], function(value, key) {return xmeditorProperties.indexOf(key) !== -1;});
          if ('state' in res["x-meditor"] && !res["x-meditor"].state) res["x-meditor"].state = 'Unspecified';
          _.merge(res, getExtraDocumentMetadata(that, doc));
          return res;
      })
      .toArray();
    })
    .then(res => (that.dbo.close(), handleSuccess(response, res)))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      handleError(response, err);
    });
};

// Exported method to get a document
module.exports.getDocument = function listDocuments (request, response, next) {
  var that = {};
  return MongoClient.connect(MongoUrl)
    .then(res => {
      that.dbo = res;
      return getDocumentModelMetadata(that.dbo, request);
    })
    .then(meta => {_.assign(that, meta)})
    .then(function() {
      var query = getDocumentAggregationQuery(that);
      query.push({$limit: 1});
      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .aggregate(query)
        .map(res => {
          var out = {};
          _.merge(res, getExtraDocumentMetadata(that, res));
          out["x-meditor"] = res["x-meditor"];
          delete res["x-meditor"];
          out["schema"] = that.model.schema;
          out["layout"] = that.model.layout;
          out["doc"] = res;
          return out;
        })
        .toArray();
    })
    .then(function(res) {
      that.result = res.length > 0 ? res[0] : {};
      return Promise.resolve(null)
    })
    .then(res => (that.dbo.close(), handleSuccess(response, that.result)))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      handleError(response, err);
    });
};

// Change workflow status of a document
module.exports.changeDocumentState = function changeDocumentState (request, response, next) {
  var that = {};
  return MongoClient.connect(MongoUrl)
    .then(res => {
      that.dbo = res;
      return getDocumentModelMetadata(that.dbo, request);
    })
    .then(meta => {_.assign(that, meta)})
    .then(function() {
      var query = getDocumentAggregationQuery(that);
      query.push({$limit: 1});

      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .aggregate(query)
        .toArray();
    })
    .then(res => res[0])
    .then(function(res) {
      var newStatesArray;
      var currentEdge;
      if (!res) throw {message: 'Document not found or is not accessible to the current user', status: 400};
      var currentEdge = _(that.workflow.edges).filter(function(e) {return e.source === res['x-meditor'].state && e.target === that.params.state;}).uniq().value();
      if (_.isEmpty(res)) throw {message: 'Document not found', status: 400};
      if (that.params.state === res['x-meditor']['state']) throw {message: 'Can not transition to state [' + that.params.state + '] since it is the current state already', status: 400};
      if (res.banTransitions) throw {message: 'Transition to state [' + that.params.state + '] from [' + res['x-meditor']['state'] + '] by the same user is not allowed', status: 400};
      if (that.targetStates.indexOf(that.params.state) === -1) throw {message: 'Can not transition to state [' + that.params.state + '] - invalid state or insufficient rights', status: 400};
      if (currentEdge.length !== 1) throw {message: 'Workflow appears to have duplicate edges', status: 400};
      that.document = res;
      that.currentEdge = currentEdge[0];
      newStatesArray = res['x-meditor'].states;
      newStatesArray.push({
        source: res['x-meditor'].state,
        target: that.params.state,
        modifiedOn: (new Date()).toISOString(),
        modifiedBy: that.user.uid
      });
      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .updateOne({_id: res._id}, {$set: {'x-meditor.states': newStatesArray}});
    })
    .then(res => {
      const shouldNotify =  _.get(that.currentEdge, 'notify', true) && that.readyNodes.indexOf(that.params.state) === -1;
      return shouldNotify ? mUtils.notifyOfStateChange(DbName, that) : Promise.resolve();
    })
    .then(res => {return mUtils.addToConnectorQueue(that, DbName, 'uui', {model: that.params.model})}) // Take an opportunity to sync with UUI    .then(res => (that.dbo.close(), handleSuccess(response, {message: "Success"})))
    .then(res => (that.dbo.close(), handleSuccess(response, {message: "Success"})))
    .catch(err => {
      try {that.dbo.close()} catch (e) {};
      handleError(response, err);
    });
};

// Internal method to list documents
function getModelContent (name) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      dbo.collection("Models").find({name:name}).sort({"x-meditor.modifiedOn":-1}).project({_id:0}).toArray(function(err, res) {
        if (err){
          console.log(err);
          try {db.close()} catch (e) {};
          reject(err);
        }
        // Fill in templates if they exist

        var promiseList = [];
        if (res[0] && res[0].hasOwnProperty("templates")){
          res[0].templates.forEach(element => {
            var macroFields = element.macro.split(/\s+/);
            promiseList.push( new Promise(
              function(promiseResolve,promiseReject){
                if ( typeof macros[macroFields[0]] === "function" ) {
                  macros[macroFields[0]](dbo,macroFields.slice(1,macroFields.length)).then(function(response){
                    promiseResolve(response);
                  }).catch(function(err){
                      console.log(err);
                      promiseReject(err);
                  });
                } else {
                  console.log("Macro, '" + macroName + "', not supported");
                  promiseReject("Macro, '" + macroName + "', not supported");
                }
              }
            ));
          });
          Promise.all(promiseList).then((response) => {
            try {
              var schema = JSON.parse(res[0].schema);
              var i=0;
              res[0].templates.forEach(element=>{
                jsonpath.value(schema,element.jsonpath,response[i++]);
                res[0].schema = JSON.stringify(schema,null,2);
              });
              db.close()
              resolve(res[0]);
            } catch (err) {
              console.error('Failed to parse schema', err)
              db.close()
              reject(err)
            }
          }).catch(
            function(err){
              try {db.close()} catch (e) {};
              reject(err);
            }
          );
        } else {
          db.close();
          resolve(res[0]);
        }
      });
    });
  });
}

//Exported method to get a model
module.exports.getModel = function getModel (req, res, next) {
  getModelContent (req.swagger.params['name'].value)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });
};

// Internal method to list documents
function findDocHistory (params) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      dbo.collection("Models").find({name:params.model}).project({_id:0}).sort({"x-meditor.modifiedOn":-1}).toArray(function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        var titleField = res[0]["titleProperty"];
        var projection = {_id:0};
        var query = {};
        if ( params.hasOwnProperty("version") && params.version !== 'latest' ) {
          query["x-meditor.modifiedOn"] = params.version;
        }
        query[titleField]=params.title;
        
        dbo.collection(params.model)
          .find(query)
          .project({ _id:0 })
          .sort({ "x-meditor.modifiedOn":-1 })
          .map(function(obj){
            return {
              modifiedOn:obj["x-meditor"].modifiedOn, 
              modifiedBy:obj["x-meditor"].modifiedBy,
              state: _.last(obj['x-meditor'].states).target,
            }
          }).toArray(function(err, res) {
            if (err){
              console.log(err);
              throw err;
            }
            db.close();
            resolve(res);
          });
      });
    });
  });
}

//Exported method to get a model
module.exports.getDocumentHistory = function getModel (req, res, next) {
  var params = getSwaggerParams(req);
  findDocHistory (params)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });
};


//Add a Comment

function addComment (comment) {
  comment["createdOn"] = (new Date()).toISOString();
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      dbo.collection("Comments").insertOne(comment, function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        var userMsg = "Added comment";
        db.close();
        resolve(userMsg);
      });
    });
  });
}

function resolveCommentWithId(params) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      var objectId = new ObjectID(params.id);
      dbo.collection("Comments").updateMany({ $or: [{_id: objectId}, {parentId: params.id}]}, {$set: {resolved: true, resolvedBy: params.resolvedBy}}, function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        var userMsg = "Comment and replies with id " + params.id + " resolved by " + params.resolvedBy;
        db.close();
        resolve(userMsg);
      });
    });
  });
}

function editCommentWithId(params, uid) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      var objectId = new ObjectID(params.id);
      dbo.collection("Comments").updateOne({ $and: [{_id: objectId}, {userUid: uid}]}, {$set: {text: params.text, lastEdited: (new Date()).toISOString()}}, function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        var userMsg = "Comment with id " + params.id + " updated";
        db.close();
        resolve(userMsg);
      });
    });
  });
}


//Exported method to get comments for document
module.exports.getComments = function getComments (req, res, next) {
  var params = getSwaggerParams(req);
  getCommentsforDoc(params)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });
};

//Exported method to resolve comment
module.exports.resolveComment = function resolveComment(req, res, next) {
  var params = getSwaggerParams(req);
  resolveCommentWithId(params)
  .then(function (response) {
    utils.writeJson(res, {code:200, message:response}, 200);
  })
  .catch(function (response) {
    utils.writeJson(res, {code:500, message: response}, 500);
  });
};

//Exported method to edit comment
module.exports.editComment = function editComment(req, res, next) {
  var params = getSwaggerParams(req);
  var uid = req.user.uid;
  editCommentWithId(params, uid)
  .then(function (response) {
    utils.writeJson(res, {code:200, message:response}, 200);
  })
  .catch(function (response) {
    utils.writeJson(res, {code:500, message: response}, 500);
  });
};

//Exported method to add a comment
module.exports.postComment = function postComment (req, res, next) {
  // Parse uploaded file
  var file = req.swagger.params['file'].value;
  // Ensure it is well formed JSON
  var comment;
  try {
    comment = safelyParseJSON(file.buffer.toString());
  } catch(err) {
    console.log(err);
    var response = {
      code:400,
      message:"Failed to parse comment"
    };
    utils.writeJson(res, response, 400);
    return;
  }
  // TODO: validate JSON based on schema

  // Insert the new comment
  addComment(comment)
  .then(function (response){
    utils.writeJson(res, {code:200, message:response}, 200);
  })
  .catch(function (response){
    utils.writeJson(res, {code:500, message: response}, 500);
  });
};

// Internal method to list comments
function getCommentsforDoc (params) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      dbo.collection("Comments").find({$and: [ {documentId: params.title}, {model: params.model} ]}).toArray(function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        db.close();
        resolve(res);
      });
    });
  });
}
