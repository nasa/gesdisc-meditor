var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var ReplSetServers = require('mongodb').ReplSetServers;
var MongoUrl = process.env.MONGOURL || "mongodb://meditor_database:27017";

MongoClient.connect(MongoUrl, function(err, db) {
    if (err) {
      console.log(err);
      throw err;
    }
    var dbo = db.db("meditor");
    var adminDb = dbo.admin();
    adminDb.replSetGetStatus(function(err,info){
        if(err){
            // Default replica set conf
            var conf = {
                "_id" : "meditor",
                "members" : [
                    {
                        "_id" : 0,
                        "host" : "meditor_database:27017"
                    },
                    {
                        "_id" : 1,
                        "host" : "meditor_database_sec_1:27017"
                    },
                    {
                        "_id" : 2,
                        "host" : "meditor_database_sec_2:27017"
                    }
                ]
            };
  
            adminDb.command({replSetInitiate: conf}, function(err, info) {
                if(err){
                    console.log(err);
                }else{
                    console.log(info);
                }
                db.close();
            });
           
        }else{
            console.log("Replica set, "+info.set+", is running");
            db.close();
        }
    });
}); 
