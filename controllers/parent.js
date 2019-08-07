var settings = require('../config/settings');
var jwt = require('jsonwebtoken');
var parentModel = require('../models/parent');
const request = require('request');

exports.login = function (req, res, next) {
    const body = req.body;
    if (body.email && body.password) {
        parentModel.auth_user(body, function (err, data) {
            if (err) {
                var resp = {
                    code: 401,
                    msg: 'Failed',
                    data: null
                };
                return res.json(resp);
            }
            if (!data){
                var resp = {
                    code: 200,
                    msg: 'Failed',
                    data: null
                };
            }else{
                if(data.isActivated == true){    
                    var id = data.id;
                    var schoolId = data.schoolId;
                    var email = data.email;
                    var schoolInfo = {
                        name: data.schoolInfo.name,
                        email: data.schoolInfo.email,
                        phone: data.schoolInfo.phone,
                        openhour: data.schoolInfo.openhour,
                        closehour: data.schoolInfo.closehour,
                        address: data.schoolInfo.address,
                        img: data.schoolInfo.img,
                    };
                    var token = jwt.sign(
                        { 
                            parentId : id, 
                            schoolId : schoolId 
                        },
                        settings.TOKEN_SECRET
                    );
    
                    var resp = {
                        code: 200,
                        msg: 'Success',
                        data: {
                            email: email,
                            schoolId : schoolId,
                            token: token,
                            schoolInfo: schoolInfo,
                            isActivated: true
                        }
                    };
                }else{
                    var resp = {
                        code: 200,
                        msg: 'Success',
                        data: {
                            isActivated: false
                        }
                    };
                }
            }

            return res.json(resp);
        })
    } else {
        var err = new Error('Wrong useremail and password.');
        err.status = 400;
        return next(err);
    }    
};

exports.registerUser = function (req, res, next) {
    const body = req.body;
    if (body.email && body.password && body.firstName && body.lastName && body.mobileNumber && body.schoolId && body.confirmPassword) {
        parentModel.register_user(body, function (err, data) {
            if (err) {
                var resp = {
                    code: 401,
                    msg: 'Failed',
                    data: null
                };
                return res.json(resp);
            }
            if (!data){
                var resp = {
                    code: 200,
                    msg: 'Failed',
                    data: null
                };                
            }else{
                if(data.err == true)
                {
                    var resp = {
                        code: 200,
                        msg: data.msg
                    };
                    return res.json(resp);
                };

                request.post(settings.EMAIL_SERVER + 'api/email/send_parent_activate_code', {
                    json: {
                        firstName : data.firstName,
                        lastName : data.lastName,
                        activateCode : data,
                        email : body.email
                    }
                }, (error, res, subBody) => {
                    if (error)
                        return response.json({code: 500, msg: err});
                })

                var resp = {
                    code: 200,
                    msg: 'Success'
                };
            }
            return res.json(resp);
        })
    } else {
        var err = new Error('Wrong Input User Info.');
        err.status = 400;
        return next(err);
    }    
};


exports.resendActivationCode = function (req, res, next) {
    const body = req.body;
    if (body.email) {
        parentModel.get_user_info(body, function (err, data) {
            if (err) {
                var resp = {
                    code: 401,
                    msg: 'Failed',
                    data: null
                };
                return res.json(resp);
            }
            if (!data){
                var resp = {
                    code: 200,
                    msg: 'Failed',
                    data: null
                };                
            }else{
                if(data.err == true)
                {
                    var resp = {
                        code: 200,
                        msg: data.msg
                    };
                    return res.json(resp);
                };

                var name = data.name;
                var firstName = name.split(', ', 0);
                var lastName = name.split(', ', 1);

                request.post(settings.EMAIL_SERVER + 'api/email/send_parent_activate_code', {
                    json: {
                        firstName : firstName,
                        lastName : lastName,
                        activateCode : data.activateCode,
                        email : body.email
                    }
                }, (error, res, body) => {
                    if (error)
                        return response.json({code: 500, msg: err});
                })

                var resp = {
                    code: 200,
                    msg: 'Success',
                };
            }
            return res.json(resp);
        })
    } else {
        var err = new Error('Wrong Input User Info.');
        err.status = 400;
        return next(err);
    }    
};

exports.activateAccount = function (req, res, next) {
    const body = req.body;
    if (body.email || body.activateCode) {
        parentModel.activate_account(body, function (err, data) {
            if (err) {
                var resp = {
                    code: 401,
                    msg: 'Failed',
                    data: null
                };
                return res.json(resp);
            }
            if (!data){
                var resp = {
                    code: 200,
                    msg: 'Failed',
                    data: null
                };                
            }else{
                if(data.err == true)
                {
                    var resp = {
                        code: 200,
                        msg: data.msg
                    };
                    return res.json(resp);
                };

                var user_info = data;

                var id = user_info.id;
                var schoolId = user_info.schoolId;
                var email = user_info.email;                
                var token = jwt.sign(
                    { 
                        parentId : id, 
                        schoolId : schoolId
                    },
                    settings.TOKEN_SECRET
                );

                var resp = {
                    code: 200,
                    msg: 'Success',
                    data: {
                        email: email,
                        schoolId : schoolId,
                        token: token
                    }
                };

                parentModel.add_login_log({parentId : id, schoolId: schoolId, email: email}, function (err, subData) {});
            }
            return res.json(resp);
        })
    } else {
        var err = new Error('Wrong Input User Info.');
        err.status = 400;
        return next(err);
    }    
};

exports.activateUser = function (req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    if (body.email && body.activateCode) {
        parentModel.activate_parent(body, function (err, data) {
            if (err) {
                var resp = {
                    code: 401,
                    msg: 'Failed',
                    data: null
                };
                return res.json(resp);
            }
            if (!data){
                var resp = {
                    code: 200,
                    msg: 'Failed',
                    data: null
                };
            }else{
                if(data.err == true)
                {
                    var resp = {
                        code: 200,
                        msg: data.msg
                    };
                    return res.json(resp);
                };
                var resp = {
                    code: 200,
                    msg: 'Success',
                };
            }
            return res.json(resp);
        })
    } else {
        var err = new Error('Wrong Input Active Code.');
        err.status = 400;
        return next(err);
    }    
};

exports.logout = function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.json('success');
            }
        });
    }else{
        return res.json('success');
    }
};