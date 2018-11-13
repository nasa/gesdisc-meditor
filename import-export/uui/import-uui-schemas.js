'use strict';
var _ = require('lodash');
var fs = require('fs');
var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var MongoUrl = process.env.MONGOURL || "mongodb://localhost:27017/";
var dbName = 'meditor';
var MODELS_PATH = './schemas';
var AUTHOR = 'nobody';

function fillPlaceholders(schemaStr) {
    schemaStr = schemaStr.replace(/\$TODAY/g, (new Date()).toISOString());
    schemaStr = schemaStr.replace(/\$AUTHOR/g, AUTHOR);
    return schemaStr;
};

function readModels() {
    return new Promise(function(resolve, reject) {
        fs.readdir(MODELS_PATH, function(err, items) {
            var res = [];
            if (err) reject(err);
            items.forEach(function(item) {
                try {
                    if (item.indexOf('json') === -1) return;
                    res.push(
                        JSON.parse(
                            fillPlaceholders(
                                fs.readFileSync(MODELS_PATH + '/' + item, 'utf8')
                            )
                        )
                    );
                } catch(e) {
                    reject(e);
                }
            })
            resolve(res);
        });
    });
};

module.exports.importModels = function importModels() {
    var that = {};
    return MongoClient.connect(MongoUrl)
        .then(res => {
            that.dbo = res;
            return readModels();
        })
        .then(res => {
            that.models = res;
            return that.models.map(function(model) {
                return that.dbo
                    .db(dbName)
                    .collection('Models')
                    .deleteMany({name: model.name});
            });
        })
        .then(res => {
            that.models.forEach(function(model) {
                model.schema = JSON.stringify(model.schema);
                model.layout = JSON.stringify(model.layout);
            })
            return that.models.map(function(model) {
                return that.dbo
                    .db(dbName)
                    .collection('Models')
                    .insertOne(model);
            });
        })
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

module.exports.importModels();