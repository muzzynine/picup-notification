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
                    return reject(AppError.throwAppError(404));
                }
                return resolve(user);
            }).catch(function(err){
                log.err("User#findUserById/DB(RDBMS) Internal error", {err: err});
                return reject(AppError.throwAppError(500));
            });
        })
    };

    User.setPushRegistration = function(user, registration){
        return new Promise(function(resolve, reject){
            user.getPushRegistration().then(function(reg){
                if(reg){
                    if(reg.registration_id !== registration){
                        reg.registration_id = registration;
                        reg.save().then(function(){
                            return resolve(reg);
                        }).catch(function(err){
                            log.err("User#setPushRegistration/DB(RDBMS) Internal error", {err: err});
                            return reject(AppError.throwAppError(500));
                        })
                    } else {
                        resolve(reg);
                    }
                } else {
                    user.createPushRegistration({
                        registration_id : registration
                    }).then(function(reg){
                        resolve(reg);
                    }).catch(function(err){
                        log.err("User#setPushRegistration/DB(RDBMS) Internal error", {err: err});
                        reject(AppError.throwAppError(500));
                    })
                }
            })
        })
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
                    user.getPushRegistration().then(function (reg) {
                        registrationIds.push(reg.registration_id);
                        setTimeout(parsingUsersRegId, 0);
                    }).catch(function (err) {
                        //nothing to do..
                    });
                })();
            }).catch(function(err) {
                log.err("User#getUsersRegistrationId/DB(RDBMS) Internal error", {err: err});
                reject(AppError.throwAppError(500));
            });
        });
    };
    return User;
};

