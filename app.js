/**
 * Created by impyeong-gang on 12/7/15.
 */

var express = require('express');
var bodyParser = require('body-parser');
var logging = require('./lib/logger');
var bunyan = require('bunyan');
var log = bunyan.getLogger('MainLogger');
var MQ = require('./lib/mq');
var GCM = require('./lib/gcm');
var config = require('./config/config');

var app = express();

if(process.env.NODE_ENV === "production"){
    log.info("Server running Production Mode");
    process.on('uncaughtException', function(err){
	log.fatal("UncaughtExceptionEmit", {err : err.toString()}, {stack : err.stack});
    });
} else if(process.env.NODE_ENV == "development"){
    log.info("Server running Development Mode");
    app.use(require('morgan')('dev'));
}

app.set('models', require('./model_migration'));

//GCMWorker.init(app.get('models'));
//GCMWorker.connect();

MQ.init(config.MQ, app.get('models'));
MQ.registerReceive(function(msg, db){
    log.info("#MQ message info" {msg : msg.body});
    var type = msg.body.type;
    var uids = msg.body.uids;
    var message = type === "notification" ? msg.body.message : msg.body.gid;

    return GCM.send(type, message, uids, db).then(function(){
	msg.del();
    }).catch(function(err){
	log.error("GCM#send", {err : err}, {stack : err.stack});
    });
});
		 
    

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

app.get('/health', function(req, res, next){
    res.status(200);
    res.json({});
    return;
});

var gcmRouter = require('./router');
app.use('/notification', gcmRouter);

log.info("Picup Notification server ready");
app.listen(8100);
