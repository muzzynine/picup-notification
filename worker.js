/**
 * Created by impyeong-gang on 12/4/15.
 */

var Promise = require('bluebird');
var amqp = require('amqplib');
var gcm = require('./gcm');
var config = require('./config/config');
var bunyan = require('bunyan');
var log = bunyan.getLogger('AMQPLogger');
var AppError = require('./lib/appError');

//재연결 시도 Interval
var RECONNECT_TIMEOUT = 5000;

var amqpUrl = config.AMQP.amqpAddr;
var q = config.AMQP.QUEUE.name;

function GCMWorker(){
    this.db = {};
    this.conn = {};
    this.ch = {};
};



GCMWorker.prototype.init = function(db){
    this.db = db;
};


/* 
 * AMQP Message queue로 연결한다.
 * 연결에 성공하면 GCMWorker instance에 conn(연결 정보) ch(채널 정보)를 유지한다.
 */

GCMWorker.prototype.connect = function(){
    var self = this;

    return new Promise(function(resolve, reject){
	amqp.connect(amqpUrl).then(function(conn){
	    //SIGINT시 amqp message queue로의 연결 끊음.
	    process.once('SIGINT', function(){ conn.close(); });
	    //연결후 queue connect에 대한 에러 이벤트 발생시 핸들러 등록
	    conn.on('error', self.reconnect.bind(self));

	    return conn.createChannel().then(function(ch){
		//재연결시 큐에 보관되어있던 메시지들을 잃어버려선 안된다. durable.
		return ch.assertQueue(q, {durable: true}).then(function(){
		    log.info("AMQP#connect Message queue connected successfully");
		    
		    ch.prefetch(1);
		    ch.consume(q, doWork, {noAck: true});
		    self.conn = conn;
		    self.ch = ch;
		    resolve();
		});

		/*
		 * 푸시를 위한 메시지 포맷은
		 * type (String) : 메시지의 종류 notification, sync
		 * uids (Array) : 보낼 대상의 uid
 		 * message (json) : { (Optional - 타입이 sync인 경우 ) gid : 동기화할 그룹 아이디
		 *                    (Optional - 타입이 notification인 경우 ) message : 보낼 메시지
		 */
		
		function doWork(msg) {
		    // parse request body
		    var parsed = JSON.parse(msg.content.toString());
		    var type = parsed.type;
		    var uids = parsed.uids;
		    var parsedMessage = parsed.message;
		    var message = parsed.type === "notification" ? parsedMessage.message : parsedMessage.gid;
		    
		    return gcm.send(type, message, uids, self.db).then(function(result){
			//Nothing to do
		    }).catch(function(err){
			log.error("AMQP#consume", {err : err.toString()}, {stack : err.stack});
		    });
		};
	    });
	}, function connectionFailed(err){
	    /* Message queue로의 연결 실패시 에러 핸들링 루틴 
	     * 연결 실패시 연결에 성공할 때까지 연결을 시도한다. 
	     */
	    
	    if(err){
		log.error("AMQP#connectionFailed", {url : amqpUrl}, {err : err.toString()}, {stack : err.stack});
		self.reconnect();
	    }
	}).catch(function(err){
	    if(err.isAppError){
		return reject(err);
	    }
	    reject(AppError.throwAppError(500, err.toString()))
	});
    });
};	


GCMWorker.prototype.reconnect = function(err){
    console.log(err);
    var self = this;
    setTimeout(function(){
	log.info("AMQP#reconnect", {url : amqpUrl}, {qName : q});
	self.connect();
    }, RECONNECT_TIMEOUT);
}


module.exports = new GCMWorker();
	    

			       
