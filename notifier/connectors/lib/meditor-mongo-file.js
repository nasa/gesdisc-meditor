var mongo = require('mongodb');

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