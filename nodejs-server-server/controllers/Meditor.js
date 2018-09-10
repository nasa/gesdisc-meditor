'use strict';

var _ = require('lodash');
var transliteration = require('transliteration');
var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;
var streamifier = require('streamifier');
var GridStream = require('gridfs-stream');
var jsonpath = require('jsonpath');
var macros = require('./Macros.js');


var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var DbName = "meditor";

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
  for ( var property in request.swagger.params ) {
    params[property] = request.swagger.params[property].value;
  }
  return params;
}

// Add a Model
function addModel (model) {
  model["x-meditor"]["modifiedOn"] = (new Date()).toISOString();
  model["x-meditor"]["modifiedBy"] = "anonymous";
  model["x-meditor"]["count"] = 0;
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

// Internal method to list models
function getListOfModels (properties) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      var projection = {_id:0};
      if (properties === undefined) {
        properties = ["name","description","icon","x-meditor","category"];
      }
      if (Array.isArray(properties)) {
        properties.forEach(function(element){
          projection[element]=1;
        });
      }
      dbo.collection("Models").find({}).sort({"x-meditor.modifiedOn":-1}).project(projection).toArray(function(err, res) {
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

//Exported method to list Models
module.exports.listModels = function listModels (req, res, next) {
  getListOfModels (req.swagger.params['properties'].value)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
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

// Add a Document
function addDocument (doc) {
  doc["x-meditor"]["modifiedOn"] = (new Date()).toISOString();
  doc["x-meditor"]["modifiedBy"] = "anonymous";
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      dbo.collection(doc["x-meditor"]["model"]).insertOne(doc, function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        dbo.collection("Models").update({name:doc["x-meditor"]["model"]}, {$inc:{"x-meditor.count":1}}, function(err, res) {
          if (err){
            console.log(err);
            throw err;
          }
          db.close();
          var userMsg = "Inserted document";
          resolve({message: userMsg, document: doc});
        });
      });
    });
  });
}

// Add an Image
function addImage (parentDoc, imageFormParam) {
  var validContentTypes = [ 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/tiff' ];
  var MAX_FILE_SIZE =  1 << 26;
  var imageRecord = {
    metadata: {
      'x-meditor': {
        modifiedOn: (new Date()).toISOString(),
        modifiedBy: 'anonymous'
      },
      'x-meditor-parent': parentDoc['x-meditor'],
      //'parent':
    },
    filename: imageFormParam.originalname,
    content_type: imageFormParam.mimetype,
    mode: 'w'   
  }

  if (validContentTypes && validContentTypes.indexOf(imageFormParam.mimetype) === -1) {
    return Promise.reject({
      status: 400,
      message: { message: 'Invalid file type. Use ' + validContentTypes.join(',') + ' file types.' }
    });
  }

  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      dbo.collection("Models").findOne({name: parentDoc['x-meditor'].model}, {_id:0, "titleProperty":1}, function(errModel, resModel) {
        var gfs;
        var writeStream;
        if (errModel) reject(errModel);
        imageRecord.metadata.filename = parentDoc[resModel.titleProperty];
        gfs = new GridStream(dbo, mongo);
        writeStream = gfs.createWriteStream(imageRecord);
      
        writeStream.on('close', function(data) {
          db.close();
          resolve("Inserted image");
        });
      
        writeStream.on('error', function(err) {
          db.close();
          reject(err);
        });
  
        streamifier.createReadStream(imageFormParam.buffer).pipe(writeStream);
      })
    });
  });
};


function getFileName (file, titlePath) {
  var filename = null;
  if (!!file && !_.isEmpty(file.filename)) filename = file.filename.replace(/\.\w+$/, '');
  // Credit: https://stackoverflow.com/questions/45239228/how-to-remove-invalid-characters-in-an-http-response-header-in-javascript-node-j
  if (!_.isEmpty(titlePath) && !_.isEmpty(_.get(file, titlePath))) filename = transliteration.slugify(_.get(file, titlePath));
  if (!!file && !_.isEmpty(file.contentType) && file.contentType.indexOf('image/') !== -1) filename += file.contentType.replace(/.*\//, '.');
  return filename;
}

// Get a stored image
function getImage(model, title, version, res) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      var gfs = new GridStream(dbo, mongo);
      gfs.files.findOne({ 'metadata.filename': title, 'metadata.x-meditor-parent.model': model }, function(metaErr, file) {
        var readstream;
        var headers;
        var fileName;

        if (metaErr) return reject({status: 500, message: metaErr});
        if (!file) return reject({ status: 404, message: 'Image not found' });

        headers = {'Content-Type': file.contentType};
        fileName = getFileName(file, 'metadata.filename');
        if (!!fileName) headers['Content-Disposition'] = 'inline; filename="' + fileName + '"';

        res.writeHead(200, headers);

        readstream = gfs.createReadStream({ _id: file._id });

        readstream.on('data', function(data) {
          res.write(data);
        });

        readstream.on('end', function() {
          try {
            res.end();
            resolve({ status: 200 });
          } catch (e) {
            console.log('Attempted to close image stream on resolved promise');
          }
        });

        readstream.on('error', function(fileErr) {
          // required to ensure end does not send 200 on error
          reject({status: 500, message: fileErr});
        });
      });
    });
  });
};

module.exports.getDocumentImage = function getDocumentImage (req, res, next) {
  var params = getSwaggerParams(req);
  getImage(params.model, params.title, params.version, res)
  .then(function (response){
    // Do nothing, response has been written already in getImage
  })
  .catch(function(response){
    console.log(response);
    utils.writeJson(res, {code: response.status || 500, message: response.message || 'Unknown error while retrieving the image'}, response.status || 500);
  });
};


//Exported method to add a Document
module.exports.putDocument = function putDocument (req, res, next) {
  // Parse uploaded file
  var file = req.swagger.params['file'].value;
  // Ensure it is well formed JSON
  var doc;
  try {
    doc = safelyParseJSON(file.buffer.toString());
  } catch(err) {
    console.log(err);
    var response = {
      code:400,
      message:"Failed to parse the Document"
    };
    utils.writeJson(res, response, 400);
    return;
  };
  // TODO: validate JSON based on schema

  // Insert the new Model
  addDocument(doc)
  .then(function(savedDoc) {
    if (!req.swagger.params.image.value) return Promise.resolve(savedDoc);
    try {
      return addImage(savedDoc.document, req.swagger.params.image.value);
    } catch (e) {
      console.log('Error saving image', e);
      return Promise.reject('Error saving image');
    }
  })
  .then(function (response){
    utils.writeJson(res, {code:200, message:"Inserted document"}, 200);
  })
  .catch(function (response){
    utils.writeJson(res, {code:500, message: response}, 500);
  });
};

function handleError(response, err) {
  console.log('Error: ', err);
  utils.writeJson(response, {code: err.status || 500, message: err.message || 'Unknown error '}, err.status || 500);
};

function handleSuccess(response, res) {
  utils.writeJson(response, res && 'message' in res ? res.message : res, 200);
}

function getDocumentAggregationQuery(meta) {
  var searchQuery = {};
  var query;
  var defaultStateName = "Unspecified";
  var defaultState = {target: defaultStateName, source: defaultStateName, modifiedOn: (new Date()).toISOString()};
  meta.sourceStates.push("Unspecified");
  query = [
    {$addFields: {'x-meditor.states': { $ifNull: [ "$x-meditor.states", [defaultState] ] }}}, // Add default state on docs with no state
    {$addFields: {'x-meditor.state': { $arrayElemAt: [ "$x-meditor.states.target", -1 ]}}}, // Find last state
    {$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
    {$group: {_id: '$' + meta.titleProperty, doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
    {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
    {$match: {'x-meditor.state': {$in: meta.sourceStates}}} // Filter states based on the role's source states
  ];
  // Build up search query if search params are available
  if ('title' in meta.params) searchQuery[meta.titleProperty] =  meta.params.title;
  if ('version' in  meta.params && meta.params.version !== 'latest') searchQuery['x-meditor.modifiedOn'] = meta.params.version;
  if (!_.isEmpty(searchQuery)) query.unshift({$match: searchQuery}); // Push search query into the top of the chain
  return query;
}

function getDocumentModelMetadata(dbo, request) {
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
  var that = {
    params: getSwaggerParams(request),
    roles: _.get(request, 'user.roles', {}),
    dbo: dbo
  };
  // TODO Useful for dubugging
  // that.roles = [ 
  //   { model: 'Alerts', role: 'Author' },
  //   { model: 'Alerts', role: 'Reviewer' } ];
  that.modelRoles = _(that.roles).filter({model: that.params.model}).map('role').value();
  return Promise.resolve()
    .then(function() {
      return that.dbo
      .db(DbName)
      .collection('Models')
      .find({name: that.params.model})
      .sort({'x-meditor.modifiedOn': -1})
      .limit(1)
      .toArray()
    })
    .then(res => {
      if (_.isEmpty(res)) throw {message: 'Model for ' + that.params.model + ' not found', status: 400};
      that.model = res[0];
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
      that.sourceStates = _(that.workflow.edges)
        .filter(function(e) {return that.modelRoles.indexOf(e.role) !== -1;})
        .map('source').uniq().value();
      that.targetStates = _(that.workflow.edges)
        .filter(function(e) {return that.modelRoles.indexOf(e.role) !== -1;})
        .map('target').uniq().value();
      return that;
    })
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
      var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];
      var query = getDocumentAggregationQuery(that);
      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .aggregate(query)
        .map(function(doc) {
          var res = {"title": doc[that.titleProperty]};
          res["x-meditor"] = _.pickBy(doc['x-meditor'], function(value, key) {return xmeditorProperties.indexOf(key) !== -1;});
          if ('state' in res["x-meditor"] && !res["x-meditor"].state) res["x-meditor"].state = 'Unspecified';
          return res;
      })
      .toArray();
    })
    .then(res => (that.dbo.close(), handleSuccess(response, res)))
    .catch(err => {
      handleError(response, err);
    })
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
          out["x-meditor"] = res["x-meditor"];
          delete res["x-meditor"];
          out["schema"] = that.model.schema;
          out["layout"] = that.model.layout;
          out["doc"] = res;
          return out;
        })
        .toArray();
    })
    .then(res => (that.dbo.close(), handleSuccess(response, res.length > 0 ? res[0] : {})))
    .catch(err => {
      handleError(response, err);
    })
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
      if (_.isEmpty(res)) throw {message: 'Document not found', satus: 400};
      if (that.params.state === res['x-meditor']['state']) throw {message: 'Can not transition to state [' + that.params.state + '] since it is the current state already', satus: 400};
      if (that.targetStates.indexOf(that.params.state) === -1) throw {message: 'Can not transition to state [' + that.params.state + '] - invalid state or insufficient rights', satus: 400};
      newStatesArray = res['x-meditor'].states;
      newStatesArray.push({
        source: res['x-meditor'].state,
        target: that.params.state,
        modifiedOn: (new Date()).toISOString()
      });
      return that.dbo
        .db(DbName)
        .collection(that.params.model)
        .update({_id: res._id}, {$set: {'x-meditor.states': newStatesArray}});
    })
    .then(res => (that.dbo.close(), handleSuccess(response, "Success")))
    .catch(err => {
      handleError(response, err);
    })
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
          throw err;
        }
        // Fill in templates if they exist

        var promiseList = [];
        if ( res[0].hasOwnProperty("templates")){
          res[0].templates.forEach(element => {
            var macroFields = element.macro.split(/\s+/);
            var schema = JSON.parse(res[0].schema);
            promiseList.push( new Promise(
              function(resolve,reject){
                if ( typeof macros[macroFields[0]] === "function" ) {
                  macros[macroFields[0]](dbo,macroFields.slice(1,macroFields.length)).then(function(response){
                      resolve(response);
                  }).catch(function(err){
                      console.log(err);
                  });
                } else {
                  console.log("Macro, '" + macroName + "', not supported");
                  throw("Macro, '" + macroName + "', not supported");
                }
              }
            ));
          });
          Promise.all(promiseList).then(
            function(response){
              var schema = JSON.parse(res[0].schema);
              var i=0;
              res[0].templates.forEach(element=>{
                jsonpath.value(schema,element.jsonpath,response[i++]);
                res[0].schema = JSON.stringify(schema,null,2);
              });
              resolve(res[0]);
            }
          ).catch(
            function(err){
            }
          );
        } else {
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
      dbo.collection("Models").find({name:params.model}).project({_id:0}).toArray(function(err, res) {
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
        dbo.collection(params.model).find(query).project({_id:0}).sort({"x-meditor.modifiedOn":-1}).map(function(obj){return {modifiedOn:obj["x-meditor"].modifiedOn, modifiedBy:obj["x-meditor"].modifiedBy}}).toArray(function(err, res) {
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
  comment["createdBy"] = "anonymous";
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

function resolveCommentWithId(id) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) throw err;
      var dbo = db.db(DbName);
      var objectId = new ObjectID(id);
      dbo.collection("Comments").findOneAndUpdate({_id: objectId}, {$set: {resolved: true}}, function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        var userMsg = "Comment with id " + id + " resolved";
        db.close();
        resolve(userMsg);
      });
    });
  });
}


//Exported method to get comments for document
module.exports.getComments = function getComments (req, res, next) {
  getCommentsforDoc(req.swagger.params['title'].value)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });
};

//Exported method to resolve comment
module.exports.resolveComment = function resolveComment(req, res, next) {
  resolveCommentWithId(req.swagger.params['id'].value)
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
function getCommentsforDoc (doc) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      dbo.collection("Comments").find({documentId:doc}).toArray(function(err, res) {
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
