/**
 * Created by impyeong-gang on 12/4/15.
 */
var amqp = require('amqplib');
var gcm = require('./gcm');
var config = require('./config/config');
var bunyan = require('bunyan');
var log = bunyan.getLogger('AMQPLogger');
var AppError = require('./lib/appError');

var amqpUrl = config.AMQP.amqpAddr;

module.exports = function(app) {
    var db = app.get('models');

    amqp.connect(amqpUrl).then(function(conn){
	process.once('SIGINT', function(){ conn.close(); });
	
        log.info("AMQP Message Queue Connected");
	
        return conn.createChannel().then(function(ch){
            var q = config.AMQP.QUEUE.name;

            return ch.assertQueue(q, {durable: true}).then(function(){
		ch.prefetch(1);

		ch.consume(q, doWork, {noAck: true});
	    });
	    
	    function doWork(msg) {
		/*
		 * 푸시를 위한 메시지 포맷은
		 * type (String) : 메시지의 종류 notification, sync
		 * uids (Array) : 보낼 대상의 uid
		 * message (json) : { (Optional - 타입이 sync인 경우 ) gid : 동기화할 그룹 아이디
		 *                    (Optional - 타입이 notification인 경우 ) message : 보낼 메시지
		 */

		// parse request body
		var parsed = JSON.parse(msg.content.toString());
		var type = parsed.type;
		var uids = parsed.uids;
		var parsedMessage = parsed.message;
		var message = parsed.type === "notification" ? parsedMessage.message : parsedMessage.gid;

		gcm.send(type, message, uids, db).then(function(result){
		    //Nothing to do
		}).catch(function(err){
		    log.error("#sendPushGCM", {err : err.toString()}, {uids : uids}, {stack : err.stack});
		});
	    };
        });
    }).catch(function(err){
	log.error("#sendPushGCM", {err : err.toString()}, {stack : err.stack});
    });
};

	    

			       
