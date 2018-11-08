var _ = require('lodash');
var transliteration = require('transliteration');
var mongo = require('mongodb');
var stream = require('stream');
var ObjectID = mongo.ObjectID;

module.exports.getFSFileName = function getFileName(modelMeta, doc) {
  var fileName = [modelMeta.titleProperty, doc[modelMeta.titleProperty], _.get(doc, "x-meditor.modifiedOn", (new ObjectID()).toString())].join('_');
  return (new ObjectID).toString();
};

module.exports.getFileSystemItem = function getFileSystemItem(dbo, filename) {
  var buf = new Buffer('');
  return new Promise(function (resolve, reject) {
    var bucket = new mongo.GridFSBucket(dbo);
    var readstream = bucket.openDownloadStream(filename);
    readstream.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
    });
    readstream.on('error', (err) => {
      reject(err);
    });
    readstream.on('end', () => {
      var res = buf.toString();
      buf = null; // Clean up memory
      readstream.destroy();
      resolve(res);
    });
  });
};

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
    bucket.find({
      _id: filename
    }).count(function (err, count) {
      if (err) return reject(err);
      if (count > 0) {
        bucket.delete(filename, function () {
          putItemHelper(bucket, resolve, reject);
        }, reject)
      } else {
        putItemHelper(bucket, resolve, reject);
      }
    }, reject);
  });
};

module.exports.assembleDocument = function (dbo, document) {
  if (_.isNil(document.image)) return Promise.resolve(document);
  return new Promise(function (resolve, reject) {
    module.exports.getFileSystemItem(dbo, document.image)
      .then(function (img) {
        document.image = img;
        resolve(document);
      }, reject);
  })
};

// Test driver for FS storage functions
function testFs() {
  var MongoUrl = 'mongodb://localhost:27017';
  var dbName = 'test';
  MongoClient.connect(MongoUrl, function(err, db) {
    if (err) throw err;
    var dbo = db.db(DbName);
    putFileSystemItem(dbo, 'test', 'this is a test')
    .then(function(a) {
      console.log('Wrote a gridFS file with metadata:', a);
      return getFileSystemItem(dbo, 'test')
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