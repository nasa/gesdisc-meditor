'use strict';

var utils = require('../utils/writer.js');
var Default = require('../service/DefaultService');
var MongoClient = require('mongodb').MongoClient;
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
        properties = ["name","description","icon","x-meditor"];
      }
      if (Array.isArray(properties)) {
        properties.forEach(function(element){
          projection[element]=1;
        });
      }
      dbo.collection("Models").find({}).project(projection).toArray(function(err, res) {
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
  });;
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
          resolve(userMsg);
        });
      });
    });
  });
}

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
  }
  // TODO: validate JSON based on schema

  // Insert the new Model
  addDocument(doc)
  .then(function (response){
    utils.writeJson(res, {code:200, message:"Inserted document"}, 200);
  })
  .catch(function (response){
    utils.writeJson(res, {code:500, message: response}, 500);
  });
};

// Internal method to list documents
function getListOfDocuments (model,properties) {
  return new Promise(function(resolve, reject) {
    MongoClient.connect(MongoUrl, function(err, db) {
      if (err) {
        console.log(err);
        throw err;
      }
      var dbo = db.db(DbName);
      dbo.collection("Models").find({name:model}).project({_id:0, "titleProperty":1}).toArray(function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }else if (res.length < 1){
          return resolve(res);
        }
        var projection = {_id:0};
        var properties = ["x-meditor.modifiedOn","x-meditor.modifiedBy"];
        if (res.length > 0){
          properties.push(res[0]["titleProperty"]);
        }
        if (Array.isArray(properties)) {
          properties.forEach(function(element){
            projection[element]=1;
          });
        }
        var titleField = res[0]["titleProperty"];
        dbo.collection(model).aggregate(
          [ {$sort:{"x-meditor.modifiedOn":1}},
            { $group : { _id : "$"+titleField, "x-meditor": {$first:"$x-meditor"}}}])
          .map(doc=>({"title":doc["_id"], "x-meditor":doc["x-meditor"]}))
          .toArray(function(err, res) {
            if(err){
              console.log(err);
            }
            db.close();
            resolve(res);
          });
      });
    });
  });
}

//Exported method to list Models
module.exports.listDocuments = function listDocuments (req, res, next) {
  getListOfDocuments (req.swagger.params['model'].value)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });;
};

// Internal method to list documents
function getDocumentContent (params) {
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
        var schema = res[0].schema;
        var layout = res[0].layout;
        var projection = {_id:0};
        var query = {};
        if ( params.hasOwnProperty("version") && params.version !== 'latest' ) {
          query["x-meditor.modifiedOn"] = params.version;
        }
        query[titleField]=params.title;
        dbo.collection(params.model).find(query).project({_id:0}).sort({"x-meditor.modifiedOn":-1}).limit(1).toArray(function(err, res) {
          if (err){
            console.log(err);
            throw err;
          }
          db.close();
          var out = {};
          out["x-meditor"] = res[0]["x-meditor"];
          delete res[0]["x-meditor"];
          out["schema"] = schema;
          out["layout"] = layout;
          out["doc"] = res[0];
          resolve(out);
        });
      });
    });
  });
}

//Exported method to get a document
module.exports.getDocument = function listDocuments (req, res, next) {
  var params = {};
  for ( var property in req.swagger.params ) {
    params[property] = req.swagger.params[property].value;
  }
  getDocumentContent (params)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });;
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
      dbo.collection("Models").find({name:name}).project({_id:0}).toArray(function(err, res) {
        if (err){
          console.log(err);
          throw err;
        }
        resolve(res[0]);
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
  });;
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
  var params = {};
  for ( var property in req.swagger.params ) {
    params[property] = req.swagger.params[property].value;
  }
  findDocHistory (params)
  .then(function (response) {
    utils.writeJson(res, response);
  })
  .catch(function (response) {
    utils.writeJson(res, response);
  });;
};
