var Promise = require('bluebird');
var mq = require('squiss');
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('MQLogger');

function MQ(){
    this.instance;
    this.db;
};

/*
 * opts.queueName The name of the queue to be polled. Used only if opts.queueUrl is  * not specified, but Squiss prefers just the name.
 * opts.queueUrl The URL of the queue to be polled. If not specified, opts.queueName *  is required.
 * opts.accountNumber If a queueName is specified, the accountNumber of the queue ow * ner can optionally be specified to access a queue in a different AWS account.
 * opts.correctQueueUrl Default false. Changes the protocol, host, and port of the q * ueue URL to match the configured SQS endpoint (see opts.awsConfig), applicable on * ly if opts.queueName is specified. This can be useful for testing against a local * SQS service, such as ElasticMQ.
 */

MQ.prototype.init = function(opts, db){
    this.instance = new mq(opts);
    this.instance.start();
    this.db = db;

    this.instance.on('error', function(err){
	log.error("#MQ", { err : err }, {stack : err.stack});
    })
};

MQ.prototype.registerReceive = function(fn){
    var db = this.db;
    if(this.instance){
	this.instance.on('message', function(msg){
	    fn(msg, db);
	});
    }
};

module.exports = new MQ();
