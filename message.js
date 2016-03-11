'use strict';
/**
 * Created by impyeong-gang on 11/4/15.
 */

var gcm = require('node-gcm');

exports.createMessage = function(collapseKey, priority, contentAvailable, delayWhileIdle, timeToLive, restrictedPackageName, dryRun, data, notification){
    var message = null;
    if(data && notification){
        message = new gcm.Message({
            collapseKey: collapseKey || null,
            priority: priority || 'high',
            contentAvailable: contentAvailable || true,
            delayWhileIdle: delayWhileIdle || true,
            timeToLive: timeToLive || 3,
            dryRun: dryRun || true,
            data: {
                key1: "message1",
                key2: "message2"
            },
            notification: {
                title: "hello world",
                body: "this is a notification"
            }
        });
    }
    return message;
};