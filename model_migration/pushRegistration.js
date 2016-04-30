/**
 * Created by impyeong-gang on 1/11/16.
 */

var Promise = require('bluebird');
var PushRegScheme = require('./scheme').PUSH_REGISTRATION;

module.exports = function(connection){
    var Push =  connection.define(PushRegScheme.TABLE, PushRegScheme.SCHEME, PushRegScheme.OPTION);

    Push.setRegistration = function(regId){
        return new Promise(function(resolve, reject){
            Push.create({
                registrationId : regId
            }).then(function(created){
                resolve(created);
            }).catch(function(err){
                reject(err);
            })
        });
    };

    return Push;

};




