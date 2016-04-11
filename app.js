/**
 * Created by impyeong-gang on 12/7/15.
 */

var express = require('express');
var bodyParser = require('body-parser');
var logging = require('./lib/logger');
var bunyan = require('bunyan');
var log = bunyan.getLogger('MainLogger');
var GCMWorker = require('./worker');

var app = express();

if(process.env.NODE_ENV === "production"){
    console.log("Server running Production Mode");
    process.on('uncaughtException', function(err){
	log.fatal("UncaughtExceptionEmit", {err : err.toString()}, {stack : err.stack});
    });
} else if(process.env.NODE_ENV == "development"){
    console.log("Server running Development Mode");
    app.use(require('morgan')('dev'));
}

app.set('models', require('./model_migration'));

GCMWorker.init(app.get('models'));
GCMWorker.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

var gcmRouter = require('./router');
app.use('/notification', gcmRouter);

log.info("Picup Notification server ready");
app.listen(8100);
