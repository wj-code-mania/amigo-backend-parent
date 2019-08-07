var settings = require('../config/settings');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var moment = require('moment');

var Cryptr = require('cryptr');
var cryptr = new Cryptr('myTotalySecretKey');

function makeCode(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
} 

exports.auth_user = function (body, callback) {
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('parent', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'email': body.email}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                    client.close();
                }
                if(items.length == 1){
                    var userInfo = items[0];
                    if(body.password == cryptr.decrypt(userInfo.password)) {
                        mongodb.collection('school', function(err, collection){
                            if (err) {
                                return callback(err);
                                client.close();
                            }
                            collection.find({'id': userInfo.schoolId}).toArray(function(err, sitems) {
                                if (err) {
                                    return callback(err);
                                    client.close();
                                }

                                var schoolInfo = {};
                                if (sitems.length == 1){
                                    schoolInfo = sitems[0];
                                }
                                userInfo.schoolInfo = schoolInfo;
                                return callback(null, userInfo);
                                client.close();
                            });
                        });
                    }else{
                        return callback(null, null);
                        client.close();
                    }
                }else{
                    return callback(null, null);
                    client.close();
                }
            });
        });
    });
}

exports.change_pwd = function (body, callback) {
    var userid = body.parentId;
    var curPwd = body.curPwd;
    var newPwd = body.newPwd;
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('parent', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'id': userid}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                    client.close();
                }
                if(items.length == 1){
                    var userInfo = items[0];
                    if(curPwd == cryptr.decrypt(userInfo.password)) {
                        var newCryptPwd = cryptr.encrypt(newPwd);
                        var changedAt = moment().format('YYYY-MM-DD hh:mm:ss');
                        var key_query = { id: userid};
                        var value_query = {$set: {password: newCryptPwd, changedAt: changedAt}};
                        collection.updateOne(key_query, value_query, function(err, res) {
                            if (err) {
                                return callback(err);
                                client.close();
                            }
                            return callback(null, res);
                            client.close();
                        });
                    }else{
                        return callback(null, null);
                        client.close();
                    }
                }else{
                    return callback(null, null);
                    client.close();
                }
            });
        });        
    });
}

exports.activate_parent = function (body, callback) {
    var email = body.email;
    var activateCode = body.activateCode;

    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('parent', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'email': email}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                    client.close();
                }
                if(items.length == 1){
                    var parentInfo = items[0];
                    if(activateCode == parentInfo.activateCode) {
                        var changedAt = moment().format('YYYY-MM-DD hh:mm:ss');
                        var key_query = { email: email };
                        var value_query = {$set: {isActivated: true, activateCode: '', changedAt: changedAt}};
                        collection.updateOne(key_query, value_query, function(err, res) {
                            if (err) {
                                return callback(err);
                                client.close();
                            }
                            return callback(null, res);
                            client.close();
                        });
                    }else{
                        return callback(null, null);
                        client.close();
                    }
                }else{
                    return callback(null, null);
                    client.close();
                }
            });
        });        
    });
}

exports.register_user = function (body, callback) {
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('parent', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'email': body.email}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                    client.close();
                }
                if(items.length == 1){
                    var userInfo = {
                        err: true,
                        msg: "User is duplicated."
                    }
                    return callback(null, userInfo);
                    client.close();
                }else{
                    collection.find().sort({id:-1}).limit(1).toArray(function(err, res) {
                        if (err) {
                            return callback(err);
                            client.close();
                        }

                        if(body.password != body.confirmPassword)
                        {
                            var userInfo = {
                                err: true,
                                msg: "Confirm Password is not match."
                            }
                            return callback(null, userInfo);
                            client.close();
                        }

                        var max = 0;
                        var int_max = 0;
                        if(res.length > 0){
                            max = res[0].id;
                            int_max = parseInt(max);
                        }
                        var activateCode = makeCode(6);
                        var new_id = int_max + 1;
                        var str_new_id = new_id.toString();
                        var createdAt = moment().format('YYYY-MM-DD hh:mm:ss');
                        var changedAt = moment().format('YYYY-MM-DD hh:mm:ss');
                        var date_time = new Date();
                        var timestamp = date_time.getTime();
                        var str_timestamp = timestamp.toString();
                        var insert_data = {
                            id: str_new_id,
                            schoolId: body.schoolId,
                            name: body.firstName + ', ' + body.lastName,
                            mobileNumber: body.mobileNumber,
                            email: body.email,
                            password: cryptr.encrypt(body.password),
                            stripeCustomerId: "",
                            isActivated: false,
                            activateCode: activateCode,
                            status: "enabled",
                            createdAt: createdAt,
                            changedAt: changedAt,
                            timestamp: str_timestamp
                        }
                        collection.insertOne(insert_data, function(err, res) {
                            if (err) return callback(err);
                            return callback(null, activateCode);
                            client.close();
                        });
                    });
                }
            });
        });
    });
}

exports.get_user_info = function (body, callback) {
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('parent', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'email': body.email}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                    client.close();
                }
                if(items.length == 1){
                    return callback(null, items[0]);
                    client.close();
                }else{
                    var userInfo = {
                        err: true,
                        msg: "Wrong user information."
                    }
                    return callback(null, userInfo);
                    client.close();
                }
            });
        });
    });
}

exports.activate_account = function (body, callback) {
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('parent', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'email': body.email}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                    client.close();
                }
                if(items.length == 1){
                    if(items[0].activateCode == body.activateCode){
                        var user_info = items[0];
                        var changedAt = moment().format('YYYY-MM-DD hh:mm:ss');
                        var key_query = { email: body.email};
                        var value_query = {$set: {isActivated: true, changedAt: changedAt}};
                        collection.updateOne(key_query, value_query, function(err, res) {
                            if (err) {
                                return callback(err);
                            }
                            return callback(null, user_info);
                            client.close();
                        });
                    }else{
                        var userInfo = {
                            err: true,
                            msg: "Wrong code."
                        }
                        return callback(null, userInfo);
                        client.close();
                    }
                }else{
                    var userInfo = {
                        err: true,
                        msg: "Wrong user information."
                    }
                    return callback(null, userInfo);
                    client.close();
                }
            });
        });
    });
}

exports.add_login_log = function (body, callback) {
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('login_log', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find().sort({id:-1}).limit(1).toArray(function(err, res) {
                if (err) {
                    return callback(err);
                    client.close();
                }

                var max = 0;
                var int_max = 0;
                if(res.length > 0){
                    max = res[0].id;
                    int_max = parseInt(max);
                }
                var new_id = int_max + 1;
                var str_new_id = new_id.toString();
                var createdAt = moment().format('YYYY-MM-DD hh:mm:ss');
                var changedAt = moment().format('YYYY-MM-DD hh:mm:ss');
                var date_time = new Date();
                var timestamp = date_time.getTime();
                var str_timestamp = timestamp.toString();
                var insert_data = {
                    id: str_new_id,
                    parentId: body.parentId,
                    schoolId: body.schoolId,
                    email: body.email,
                    createdAt: createdAt,
                    changedAt: changedAt,
                    timestamp: str_timestamp
                }
                collection.insertOne(insert_data, function(err, res) {
                    if (err) return callback(err);
                    return callback(null, res);
                    client.close();
                });
            });
        });
    });
}