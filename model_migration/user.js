/**
 * Created by impyeong-gang on 1/11/16.
 */
var Promise = require('bluebird');
var UserShceme = require('./scheme').USER;
var AppError = require('../lib/appError');
var bunyan = require('bunyan');
var log = bunyan.getLogger('DataModelLogger');

module.exports = function(connection){
    var User = connection.define(UserShceme.TABLE, UserShceme.SCHEME);

    User.findUserById = function(uid){
        return new Promise(function(resolve, reject){
            return User.findOne({
                where : {
                    id : uid
                }
            }).then(function(user){
                if(!user){
		    throw AppError.throwAppError(404, "Not exist user");
                }
                resolve(user);
            }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
            });
        });
    };

    User.setPushRegistration = function(user, registration){
        return new Promise(function(resolve, reject){
            user.getPushRegistration().then(function(reg){
                if(reg){
                    if(reg.registration_id !== registration){
                        reg.registration_id = registration;
                        return reg.save().then(function(){
                            resolve(reg);
                        });
                    } else {
                        resolve(reg);
                    }
                } else {
                    return user.createPushRegistration({
                        registration_id : registration
                    }).then(function(reg){
                        resolve(reg);
                    })
                }
            }).catch(function(err){
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
	    });
        });
    };


    User.getUsersRegistrationId = function(uidArray){
        return new Promise(function(resolve, reject){
            User.findAll({
                where : {
                    id : {
                        $in:uidArray
                    }
                }
            }).then(function(users) {
                var ulist = users.slice(0);
                var registrationIds = [];
                (function parsingUsersRegId() {
                    if (ulist.length === 0) {
                        return resolve(registrationIds);
                    }
                    var user = ulist.splice(0, 1)[0];
                    return user.getPushRegistration().then(function (reg) {
			//유저의 Registration 정보가 없으면 해당 유저에게는 메시지 보내지 않음
			if(reg){
                            registrationIds.push(reg.registration_id);
			}
			setTimeout(parsingUsersRegId, 0);
                    }).catch(function (err) {
			throw err;
                        //nothing to do..
                    });
                })();
            }).catch(function(err) {
		if(err.isAppError){
		    return reject(err);
		}
		reject(AppError.throwAppError(500, err.toString()));
            });
        });
    };
    return User;
};

