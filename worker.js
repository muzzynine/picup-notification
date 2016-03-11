/**
 * Created by impyeong-gang on 12/4/15.
 */
var amqp = require('amqplib/callback_api');
var gcm = require('./gcm');
var config = require('./config');
var bunyan = require('bunyan');
var log = bunyan.getLogger('AMQPLogger');

var amqpUrl = config.AMQP.amqpAddr;

module.exports = function(app) {

    var db = app.get('models');

    amqp.connect(amqpUrl, function (err, conn) {
        if (err) {
            log.err("AMQPWorker#connect failed", {err: err});
            throw err;
        }
        log.info("AMQP Message Queue Connected");
        conn.createChannel(function (err, ch) {
            var q = config.AMQP.QUEUE.name;

            ch.assertQueue(q, {durable: false});

            ch.consume(q, function (msg) {
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

                gcm.send(type, message, uids, db, function (err, result) {
                    if (err) {
                        log.err("AMQPWorker#gcm message push failed", {err: err});
                    }
                });
            }, {noAck: true});
        });
    });
}