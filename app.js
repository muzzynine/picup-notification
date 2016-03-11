/**
 * Created by impyeong-gang on 12/7/15.
 */
var express = require('express');
var bodyParser = require('body-parser');
var logging = require('./lib/logger');
var bunyan = require('bunyan');
var log = bunyan.getLogger('MainLogger');

var app = express();

app.set('models', require('./model_migration'));
require('./worker')(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));

var gcmRouter = require('./router');
app.use('/notification', gcmRouter);

log.info("Picup Notification server ready");
app.listen(8100);
