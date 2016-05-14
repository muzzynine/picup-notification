/**
 * Created by impyeong-gang on 1/11/16.
 */
var _ = require('lodash');
var Promise = require('bluebird');
var UserShceme = require('./scheme').USER;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');

module.exports = function(connection){
    var User = connection.define(UserShceme.TABLE, UserShceme.SCHEME, UserShceme.OPTION);

    User.findUserById = function(uid){
        return User.findOne({
            where : {
                id : uid,
		isAlive : true
            }
        }).then(function(user){
            if(!user){
		throw AppError.throwAppError(404, "Not exist user");
            }
            return user;
        });
    };

    User.setPushRegistration = function(user, registration){
        return user.getPushRegistration({
	    where : {
		isAlive : true
	    }
	}).then(function(reg){
            if(reg){
                if(reg.registrationId !== registration){
                    reg.registrationId = registration;
                    return reg.save().then(function(){
                        return reg;
                    });
                } else {
                    return reg;
                }
            } else {
                return user.createPushRegistration({
                    registrationId : registration
                }).then(function(reg){
                    return reg;
                })
            }
        });
    };


    User.getUsersRegistrationId = function(uidArray){
	return new Promise(function(resolve, reject){
	    var users = [];
	    try{
		//Instantiate
		_.forEach(uidArray, function(uid){
		    var user = User.build({
			id : uid
		    });
		    users.push(user);
		});
	    } catch(err){
		throw AppError.throwAppError(500, err.toString());
	    }
	    
            var ulist = users.slice(0);
            var registrationIds = [];
            (function parsingUsersRegId() {
		if (ulist.length === 0) {
                    return resolve(registrationIds);
		}
		var user = ulist.splice(0, 1)[0];
		user.getPushRegistration({
		    where : {
			isAlive : true
		    }
		}).then(function (reg) {
		    //유저의 Registration 정보가 없으면 해당 유저에게는 메시지 보내지 않음
		    if(reg){
			registrationIds.push(reg.registrationId);
		    }
		    setTimeout(parsingUsersRegId, 0);
		})
            })();
	});
    };
    
    return User;
};

