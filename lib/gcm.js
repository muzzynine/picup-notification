'use strict';

/**
 * Created by impyeong-gang on 11/4/15.
 */

var Promise = require('bluebird');
var gcm = require('node-gcm');
var config = require('../config/config');
var bunyan = require('bunyan');
var log = bunyan.getLogger('AMQPLogger');
var AppError = require('./appError');

var SERVER_ACCESS_KEY = config.GCM.ACCESS_KEY;
var MAX_SEND_AT_A_TIME = 700;
var RETRY_NUMBER = 3;

var sender = new gcm.Sender(SERVER_ACCESS_KEY);

exports.send = function(type, message, uids, db){
    return new Promise(function(resolve, reject){
	var User = db.user;
	return User.getUsersRegistrationId(uids).then(function(registrationIds){
            var msg = new gcm.Message();
            msg.addData("type", type);
            msg.addData("data", message);

            if(registrationIds.length > 0) {
		sender.send(msg, registrationIds, function (err, result) {
                    if (err) {
			return reject(err);
                    }
		    return resolve();
		});
            }
	    resolve();
	});
    });
};
