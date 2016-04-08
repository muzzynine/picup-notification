'use strict';

/**
 * Created by impyeong-gang on 11/4/15.
 */
var express = require('express');
var router = express.Router();
var bunyan = require('bunyan');
var log = bunyan.getLogger('RouterLogger');

module.exports = router;


/**
 * @api {post} /notification/registration GCM 토큰을 등록한다.
 * @apiGroup push
 *
 * @apiParam {String} uid 유저의 유저 아이디
 * @apiParam {String} registration_id 등록할 gcm access token
 *
 * @apiSuccess {String}   uid      uid 유저의 유저 아이디
 * @apiSuccess {String}   registration_id     푸시를 요청한 유저 아이디의 리스트
 *
 * @apiError 500 Internal 서버 오류
 *
 * @apiPermission picup-user
 *
 */

router.post('/registration', function(req, res){
    var uid = req.body.uid;
    var registrationId = req.body.registration_id;

    var User = req.app.get('models').user;

    User.findUserById(uid).then(function (user) {
        return User.setPushRegistration(user, registrationId).then(function (reg) {
            res.status(200);
            res.json({
                uid: user.id,
                registration_id: reg.registration_id
            });
        })
    }).catch(function (err) {
	if(err.isAppError){
	    res.status(err.errorCode);
	    res.json(err);
	} else {
	    res.status(500);
	    res.json({});
	}
    });
});
