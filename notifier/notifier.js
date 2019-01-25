var MongoClient = require('mongodb').MongoClient;
var MongoUrl = process.env.MONGOURL;
var NotificationQueueCollectionName = 'queue-notifications';
var os = require('os');
var nodemailer = require('nodemailer');

var HOST_NAME = process.env.HOST_NAME || os.hostname();

var transporter = nodemailer.createTransport({
    newline: 'unix',
    host: process.env.MAIL_HOST,
    port: 25,
    tls: {
        rejectUnauthorized: false,
    }
  });

function notify(subject, textMessage, htmlMessage, mailtoURL) {
    try {
      transporter.sendMail({
        from: `mEditor <DoNotReply@${HOST_NAME}>`,
        to: mailtoURL,
        subject: subject,
        text: textMessage,
        html: htmlMessage
      }, function(err) {
        if (err) console.error(err);
      });
    } catch (e) {
      console.error('Monitor: exception in mailer', e);
    }
  };
  
function getMessagesForProcessing (dbo){
    return new Promise(function(resolve, reject) {
        dbo.collection(NotificationQueueCollectionName).find(
            {"x-meditor.processedOn":{$exists:false}}
        ).toArray(function(err,findResponse){
            if (err){
                console.error(err);
                throw(err);
            }else{
                var docIds = findResponse.map(element=>element["_id"]);
                var procTime = {$set:{"x-meditor.processedOn":(new Date()).toISOString()}};
                dbo.collection(NotificationQueueCollectionName).update( {_id:{$in:docIds}}, procTime, {multi:true}, function(err,updateResponse){
                    if (err){
                        console.error(err);
                        throw(err);
                    }else{
                        var sentTime = {$set:{"x-meditor.notifiedOn":(new Date()).toISOString()}};
                        findResponse.forEach(function(element){
                            var subject = element.subject;
                            var textMessage = element.body;
                            var htmlMessage = element.body + "<p>See <a href='" + element.link.url + "'>" + findResponse[0].link.label + "</a> for more details.</p>";
                            var mailToUrl = element.to.join();
                            notify(subject,textMessage, htmlMessage, mailToUrl);
                        });
                        dbo.collection(NotificationQueueCollectionName).update( {_id:{$in:docIds}}, sentTime, {multi:true}, function(err,sentResponse){
                            if(err){
                                console.error(err);
                                throw(err);
                            }else{
                                console.log("Sent "+findResponse.length+" notifications");
                            }
                        });
                        resolve(findResponse);
                    }
                });
            }
        });
    } );
}

MongoClient.connect(MongoUrl, function(err, db) {
    if (err) {
      console.error(err);
      throw err;
    }
    var dbo = db.db("meditor");
    getMessagesForProcessing(dbo).then(function(response){
        console.log(response);
        db.close();
    }).catch(function(err){
        console.error(err);
    });
});
