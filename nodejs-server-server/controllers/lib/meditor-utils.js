var _ = require('lodash');
var transliteration = require('transliteration');
var mongo = require('mongodb');
var stream = require('stream');
var ObjectID = mongo.ObjectID;

// For a given document and metadata, returns a unique file name,
// to be used when storing the file on the file system
module.exports.getFSFileName = function getFileName(modelMeta, doc) {
  var fileName = [modelMeta.titleProperty, doc[modelMeta.titleProperty], _.get(doc, "x-meditor.modifiedOn", (new ObjectID()).toString())].join('_');
  fileName == transliteration.slugify(fileName); // Unused for now
  return (new ObjectID).toString();
};

// Retrieves a file from GridFS and returns it as a string
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