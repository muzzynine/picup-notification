'use strict';

/**
 * Created by impyeong-gang on 11/4/15.
 */
var gcm = require('node-gcm');
var config = require('./config');
var server_access_key = config.GCM.ACCESS_KEY;
var bunyan = require('bunyan');
var log = bunyan.getLogger('AMQPLogger');


var MAX_SEND_AT_A_TIME = 700;
var RETRY_NUMBER = 3;

var sender = new gcm.Sender(server_access_key);

exports.send = function(type, message, uids, db, fn){

    var User = db.user;

    return User.getUsersRegistrationId(uids).then(function(registrationIds){
        var msg = new gcm.Message();
        msg.addData("type", type);
        msg.addData("data", message);

        if(registrationIds.length > 0) {
            sender.send(msg, registrationIds, function (err, result) {
                if (err) {
                    log.err("AMQPWorker#gcm message push failed", {err: err});
                    return fn(err);
                }
                log.info(result);
                fn(null, result);
            });
        } else {
            fn(null, null);
        }

    }).catch(function(err){
        log.err("AMQPWorker#getUsersRegistrationId", {err: err});
        return fn(err);
    })

};
