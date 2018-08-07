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
  var params = {};
  for ( var property in req.swagger.params ) {
    params[property] = req.swagger.params[property].value;
  }
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

// Exported method to list Models
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
      dbo.collection("Models").find({name:params.model}).sort({"x-meditor.modifiedOn":-1}).project({_id:0}).toArray(function(err, res) {
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
  });;
};

//Exported method to resolve comment
module.exports.resolveComment = function resolveComment(req, res, next) {
  resolveCommentWithId(req.swagger.params['id'].value)
  .then(function (response) {
    utils.writeJson(res, {code:200, message:response}, 200);
  })
  .catch(function (response) {
    utils.writeJson(res, {code:500, message: response}, 500);
  });;
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
