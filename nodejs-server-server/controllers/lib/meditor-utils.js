var _ = require('lodash');
var transliteration = require('transliteration');
var mongo = require('mongodb');
var stream = require('stream');
var ObjectID = mongo.ObjectID;
var mFile = require('./meditor-mongo-file');

var NotificationQueueCollectionName = 'queue-notifications';

// For a given document and metadata, returns a unique file name,
// to be used when storing the file on the file system
module.exports.getFSFileName = function getFileName(modelMeta, doc) {
  var fileName = [modelMeta.titleProperty, doc[modelMeta.titleProperty], _.get(doc, "x-meditor.modifiedOn", (new ObjectID()).toString())].join('_');
  fileName == transliteration.slugify(fileName); // Unused for now
  return (new ObjectID).toString();
};

// Stores a string 'data' attribute witha a given 'metadata' object on GridFS
// If a file with a given 'filename' already exists on FS - the original file
// is removed and replaced with the new one
module.exports.putFileSystemItem = function putFileSystemItem(dbo, filename, data, meta) {
  var options = meta ? {
    metadata: meta
  } : null;
  var putItemHelper = function (bucket, resolve, reject) {
    var writeStream = bucket.openUploadStreamWithId(filename, filename, options);
    var s = new stream.Readable();
    s.push(data);
    s.push(null); // Push null to end stream
    s.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  };
  return new Promise(function (resolve, reject) {
    var bucket = new mongo.GridFSBucket(dbo);
    bucket.find({_id: filename}).count(function (err, count) {
      if (err) return reject(err);
      if (count > 0) {
        bucket.delete(filename, function (err) {
          if (err) {
            reject(err);
          } else {
              putItemHelper(bucket, resolve, reject);
          }
        })
      } else {
        putItemHelper(bucket, resolve, reject);
      }
    }, reject);
  });
};

// A test driver for FS storage functions
function testFs() {
  var MongoClient = mongo.MongoClient;
  var MongoUrl = 'mongodb://localhost:27017';
  var DbName = 'test';
  MongoClient.connect(MongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DbName);
    putFileSystemItem(dbo, 'test', 'this is a test')
    .then(function(a) {
      console.log('Wrote a gridFS file with metadata:', a);
      return mFile.getFileSystemItem(dbo, 'test')
    })
    .then(function(a) {
      console.log('Got data back from a gridFS file:', a);
      db.close();
    })
    .catch(function(e) {
      console.log(e);
      db.close();
    })
  });
}

// Inserts a data message into DB queue of connectors
module.exports.addToConnectorQueue = function addToConnectorQueue(meta, DbName, target, data) {
  return meta.dbo.db(DbName).collection('queue-connectors').insertOne({
    created: Date.now(),
    target: target,
    data: data,
  });
};

// Converts dictionary params back into URL params
module.exports.serializeParams = function serializeParams(params, keys) {
  return _(params)
  .pickBy(function(val,key) {return (!!keys ? keys.indexOf(key) !== -1 : true) && !_.isNil(val);})
  .map(function(val, key) {return key + "=" + encodeURIComponent(val);}).value().join('&')
}

// Create a DB message for the notifier daemon to mail to relevant users
module.exports.notifyOfStateChange = function notifyOfStateChange(DbName, meta) {
  var that = {};
  var targetEdges = _(meta.workflow.edges).filter(function(e) {return e.source === meta.params.state;}).uniq().value();
  var targetNodes = _(targetEdges).map('target').uniq().value();
  var targetRoles = _(targetEdges).map('role').uniq().value();
  var tos;
  var tosusers;
  // User: who sent action, including emailAddress, firstName, lastName
  var notification = {
    "to": [ ], // This is set later
    "cc": [ ], // This is set later
    "subject": meta.params.model + " document is now " + meta.params.state,
    "body":
      "An " + meta.params.model + " document drafted by ###AUTHOR### has been marked by " + meta.currentEdge.role + " "
      + meta.user.firstName + ' ' + meta.user.lastName
      + " as '" + meta.currentEdge.label + "' and is now in a '"
      + meta.currentEdge.target + "' state." 
      + " An action is required to transition the document to one of the [" + targetNodes.join(', ') + "] states.",
    "link": {
        label: meta.params.title,
        url: process.env.APP_UI_URL + "/#/document/edit?" + module.exports.serializeParams(meta.params, ['title', 'model', 'version'])
    },
    "createdOn": (new Date()).toISOString()
  };
  return Promise.resolve()
    .then(function() {
      return meta.dbo
        .db(DbName)
        .collection('Users')
        .aggregate(
          [{$sort: {"x-meditor.modifiedOn": -1}}, // Sort descending by version (date)
          {$group: {_id: '$id', doc: {$first: '$$ROOT'}}}, // Grab all fields in the most recent version
          {$replaceRoot: { newRoot: "$doc"}}, // Put all fields of the most recent doc back into root of the document
          {$unwind: '$roles'},
          {$match: {'roles.model': meta.params.model, 'roles.role': {$in: targetRoles}}},
          {$group: {_id: null, ids: {$addToSet: "$id"}}}
        ])
        .toArray();
    })
    .then(function(users) {
       // TOs are all users that have a right to transition the document into a new state
      if (users.length === 0) throw {message: 'Could not find addressees to notify of the status change', status: 400};
      tos = _(users[0].ids).uniq().value();
      return meta.dbo
        .db(DbName)
        .collection('users-urs')
        .find({uid: {$in: tos}})
        .project({_id:0, emailAddress: 1, firstName: 1, lastName: 1, uid: 1})
        .toArray();
    })
    .then(users => {
       // ccs are the original author and the person who just made the state change, unless they are already in TO
      var ccs =  _([meta.user.uid, meta.document['x-meditor'].modifiedBy]).uniq().difference(tos).value();
      tosusers = users;
      notification.to = _.uniq(users.map(u => '"'+ u.firstName + ' ' + u.lastName + '" <' + u.emailAddress + '>'));
      if (notification.to.length === 0) throw {message: 'Could not find addressees to notify of the status change', status: 400};
      return meta.dbo
        .db(DbName)
        .collection('users-urs')
        .find({uid: {$in: ccs}})
        .project({_id:0, emailAddress: 1, firstName: 1, lastName: 1, uid: 1})
        .toArray();
      })
    .then(users => {
      // Replace author's name placeholder with an actual name (find it in either users or tosusers)
      notification.body = notification.body.replace(
        '###AUTHOR###',
        _(users.length > 0 ? users : tosusers)
          .filter({uid: meta.document['x-meditor'].modifiedBy})
          .map(function(u) {return u.firstName + ' ' + u.lastName})
          .value()[0]
      );
      notification.cc = _.uniq(users.map(u => '"'+ u.firstName + ' ' + u.lastName + '" <' + u.emailAddress + '>'));
      return meta.dbo.db(DbName).collection(NotificationQueueCollectionName).insertOne(notification);
    });
};
