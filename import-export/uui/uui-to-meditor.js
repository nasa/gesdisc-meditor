'use strict';
var _ = require('lodash');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var ObjectID = mongo.ObjectID;
var Grid = require('gridfs-stream');
var stream = require('stream');

var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";

var dbMeditor = 'meditor';
var dbUui = 'uui-db';

// UUI model attributes to import
var mappableFields = [
    '_id', 'title', 'abstract', 'body', 'type', 'imageCaption', 'additionalAuthors', // Common fields
    'expiration', 'start', 'severity', // Alerts
    'carousel', 'gallery', 'link', // Images
    'answer', // FAQs
    'relatedHowto', 'example', 'prereq', 'procedure', 'additionalInfo', // Howto
    'pubAuthors', 'year', 'conferenceName', 'journalName', 'pages', 'doi', // Publications
    'tags', 'datasets', 'groups', 'notes' // Common block
];

// Mappinng of DB names
var modelMapping = [
    {from: 'alerts', to: 'Alerts'},
    {from: 'documents', to: 'Documents'},
    {from: 'faqs', to: 'FAQs'},
    {from: 'glossary', to:'Glossary'},
    {from: 'howto', to: 'Howto'},
    {from: 'images', to: 'Images'},
    {from: 'news', to: 'News'},
    {from: 'publications', to: 'Publications'},
    {from: 'tools', to: 'Tools'}
];

// Cloned from Meditor.js
function putFileSystemItem(dbo, filename, data, meta) {
    var options = meta ? {metadata: meta} : null;
    var putItemHelper = function(bucket, resolve, reject) {
        var writeStream = bucket.openUploadStreamWithId(filename, filename, options);
        var s = new stream.Readable();
        s.push(data);
        s.push(null); // Push null to end stream
        s.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    };
    return new Promise(function(resolve, reject) {
        var bucket = new mongo.GridFSBucket(dbo);
        bucket.find({_id: filename}).count(function(err, count) {
        if (err) return reject(err);
        if (count > 0) {
            bucket.delete(filename, function() {
            putItemHelper(bucket, resolve, reject);
            }, reject)
        } else {
            putItemHelper(bucket, resolve, reject);
        }
        }, reject);
    });
}

// https://stackoverflow.com/questions/10623798/writing-node-js-stream-into-a-string-variable
function streamToString(stream, cb) {
    var image_buf = new Buffer('');
    stream.on('data', (chunk) => {
        image_buf = Buffer.concat([image_buf, chunk]);
    });
    stream.on('error', (err) => {
        cb(null);
    });
    stream.on('end', () => {
        var res = image_buf.toString('base64');
        image_buf = null; // Clean up memory
        cb(res);
       
    });
}

function getDocImage(meta, modelConfig, document) {
    if (!document.fileRef) return Promise.resolve(null);
    return new Promise(function(resolve, reject) {
        meta.gfs.files.findOne({ _id: document.fileRef._id }, function(metaErr, metaInfo) {
            if (metaErr) reject(metaErr);
            var readstream = meta.gfs.createReadStream({ _id: document.fileRef._id});
            streamToString(readstream, (data) => {
                readstream.destroy(); // Clean up memory
                if (data !== null) {
                    resolve('data:' + metaInfo.contentType + ';base64,' + data);
                } else {
                    console.log('Could not read ', metaInfo);
                }
            });
        });
    });
};

function importDocument(meta, modelConfig, document) {
    //if (n_items[modelConfig.from.model]++ > 100 && modelConfig.from.model==='images') return Promise.resolve();

    var newDocument = {
        "x-meditor" : {
            model : modelConfig.to.model,
            modifiedOn : document.updated.toISOString(),
            modifiedBy : modelConfig.from.users[document.author.toString()] || document.author,
            states : [
                {
                    source : "Init",
                    target : "Draft",
                    modifiedOn : document.updated.toISOString()
                }
            ]
        }
    };
    _.forEach(mappableFields, function(field) {
        if (field in document) newDocument[field] = document[field];
    });
    if (document.published) {
        newDocument["x-meditor"].states.push({
            "source" : "Approved",
            "target" : "Published",
            "modifiedOn" : document.lastPublished.toISOString()
        })
    }
    return getDocImage(meta, modelConfig, document)
        .then(function(img) {
            if (img !== null) {
                newDocument.image = (new ObjectID()).toString();
                return putFileSystemItem(meta.dbo.db(dbMeditor), newDocument.image, img, {
                    model: newDocument["x-meditor"]["model"],
                    version: newDocument["x-meditor"]["modifiedOn"],
                    originalTitle: newDocument[modelConfig.to.modelMeta.titleProperty]
                })
            }
            return Promise.resolve(null);
        })
        .then(function() {
            return meta.dbo
                .db(dbMeditor)
                .collection(modelConfig.to.model)
                .insertOne(newDocument);
        })
        .then(function() {
            // Clean up memory
            newDocument.image = null;
            newDocument = null;
            return Promise.resolve('Success');
        })
        .catch(function(err) {
            console.log('Could not write ', newDocument.title, err);
            return Promise.resolve('Failed');
        })
};

function importModel(meta, cfg) {
    var that = {};
    var modelConfig = {
        from: {model: cfg.from},
        to: {model: cfg.to}
    };
    return Promise.resolve()
        .then(function() {
            return meta.dbo
                .db(dbMeditor)
                .collection("Models")
                .find({
                    name: modelConfig.to.model
                })
                .project({
                    _id: 0
                })
                .sort({
                    "x-meditor.modifiedOn": -1
                })
                .limit(1)
                .toArray();
        })
        .then(function(res) {
            modelConfig.to.modelMeta = res[0];
            //console.log(JSON.stringify(JSON.parse(modelConfig.to.modelMeta[0].schema), null,2));
            // Get all mEditor titles
            return meta.dbo
                .db(dbMeditor)
                .collection(modelConfig.to.model)
                .aggregate([{
                    $group: {_id: null, titles: {$addToSet: "$" + modelConfig.to.modelMeta.titleProperty}}
                }])
                .toArray();
        })
        .then(function(res) {
            
            modelConfig.to.titles = res.length > 0 ? res[0].titles : [];
            // Get UUI users
            return meta.dbo
                .db(dbUui)
                .collection('users')
                .find()
                .toArray();
        })
        .then(function(users) {
            modelConfig.from.users = users.reduce(function (accumulator, currentValue) {
                accumulator[currentValue._id.toString()] = currentValue.uid;
                return accumulator;
              }, {});
            // Get all UUI documents that do not originate from mEditor
            return meta.dbo
                .db(dbUui)
                .collection(modelConfig.from.model)
                .find({originName: {$ne: 'meditor'}})
                .toArray();
        })
        .then(function(docs) {
            var titleDelta;
            var deleteQuery = {};
            that.docs = docs;
            modelConfig.from.titles = _(docs).map('title').uniq().value();
            // Find all mEditor docs that came from UUI and remove them
            titleDelta = _.intersection(modelConfig.to.titles, modelConfig.from.titles);
            deleteQuery[modelConfig.to.modelMeta.titleProperty] = {$in: titleDelta};
            console.log('UUI ' + modelConfig.from.model + ' to remove from mEditor:', titleDelta.length);
            return meta.dbo
                .db(dbMeditor)
                .collection(modelConfig.to.model)
                .deleteMany(deleteQuery);
        })
        .then(function() {
            // Iterate over documents
            return Promise.all(that.docs.map(doc => (importDocument(meta, modelConfig, doc))));
        })
        .then(function(res) {
            // All done
            console.log('All done, imported', res.length, 'documents of type', modelConfig.to.model);
            return "Done with " + modelConfig.to.model;
        });
};

module.exports.syncItems = function syncItems() {
    var that = {};
    var xmeditorProperties = ["modifiedOn", "modifiedBy", "state"];

    return MongoClient.connect(MongoUrl)
        .then(res => {
            that.dbo = res;
            that.gfs = new Grid(that.dbo.db(dbUui), mongo);
            return Promise.all(modelMapping.map(modelConfig => (importModel(that, modelConfig))));
        })
        .then(res => {
            console.log(res);
        })
        .then(res => {})
        .then(function() {
            console.log('Closing DB');
            that.dbo.close();
        })
        .catch(err => {
            console.log('Found errors. Closing DB');
            try {
                that.dbo.close()
            } catch (e) {};
            console.log(err.status || err.statusCode, err.message || 'Unknown error');
            return Promise.reject({
                status: err.status || err.statusCode,
                message: err.message || 'Unknown error'
            });
        });
};

exports.syncItems();


/*
{
"_id" : ObjectId("5bc0af3d43cb7c0e0aedd0bf"),
"abstract" : "test",
"expiration" : "2018-10-12 10:26:16-04:00",
"start" : "2018-10-12 10:26:16-04:00",
"severity" : "normal",
"body" : "<p>test</p>\n",
"x-meditor" : {
    "model" : "Alerts",
    "modifiedOn" : "2018-10-12T14:27:09.066Z",
    "modifiedBy" : "azasorin",
    "states" : [
        {
            "source" : "Init",
            "target" : "Draft",
            "modifiedOn" : "2018-10-12T14:27:09.066Z"
        }
    ]
}

{
	"_id" : ObjectId("584f299be01b045f7d3429ee"), --> can preserve, but not required
	"body" : "<p>Due to a18:59:24.</p>\n", --> body
	"updated" : ISODate("2011-12-05T21:26:51Z"), --> changes from version to version
	"author" : "sbudala", --> need to merge with users first to resolve '58066d97698c14087bab4c52' etc
	"seqNum" : 0, --> can ignore??
	"tags" : ["nrt"], --> tags?
	"created" : ISODate("2011-12-05T21:26:51Z"), --> unchanged across versions
	"start" : ISODate("2011-12-05T21:00:00Z"), --> start
	"lastPublished" : ISODate("2011-12-05T21:26:51Z"),
	"expiration" : ISODate("2011-12-09T21:00:00Z"), --> expiration
	"published" : true, --> goes into states, all imported are 'approved' by default
	"notes" : "Imported from Plone http://disc.gsfc.nasa.gov/alerts/airs-nrt-data-gaps-for-12-05-2011.......", --> What to do?
	"refId" : ObjectId("584f299be01b045f7d3429ec"), --> can be thrown away
	"title" : "AIRS NRT data gaps for 12/05/2011" --> title
}

*/


// mEditor image is stored in Base64 like this "image" : "data:image/png;base64,iVBORw0KGgoAA..."
// { "_id" : ObjectId("5bc778dd4534fb252fe4ecaf"),
//      "title" : "asds zzzz fffff",
//      "description" : "Message to ",
//      "image" : "data:image/png;base64,iVBORw0KGgoAAAANSU...",
//      "x-meditor" : { ...}
// }
// UUI image is stored like this:
// "fileRef" : {
//     "length" : 149272,
//     "_id" : ObjectId("584f29a5e01b045faee880e1"),
//     "contentType" : "image/png",
//     "filename" : "NASA Ocean Biogeochemical Model (NOBM) data added to Giovanni",
//     "md5" : "41dc869cf4b866ed865d1f42366654cd"
// },

// {
// 	"_id" : ObjectId("584f29a5e01b045faee880e1"),
// 	"contentType" : "image/png",
// 	"chunkSize" : 261120,
// 	"filename" : "NASA Ocean Biogeochemical Model (NOBM) data added to Giovanni",
// 	"length" : 149272,
// 	"uploadDate" : ISODate("2016-12-12T22:50:13.054Z"),
// 	"md5" : "41dc869cf4b866ed865d1f42366654cd"
// }