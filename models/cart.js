var settings = require('../config/settings');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var moment = require('moment');

exports.add_to_cart = function (body, callback) {
    var parentId = body.parentId;
    var schoolId = body.schoolId;
    var productId = body.productId;
    var studentList = body.studentList;
    var options = body.options;
    var bookingDate = body.bookingDate;
    var qty = body.qty;
    var comments = body.comments;
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('cart', function (err, collection) {
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
                    parentId: parentId,
                    schoolId: schoolId,
                    productId: productId,
                    students: studentList,
                    qty: qty,
                    bookingDate: bookingDate,
                    options: options,
                    status: "enabled",
                    createdAt: createdAt,
                    changedAt: changedAt,
                    timestamp: str_timestamp,
                    comments:comments
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

exports.update_cart_info = function (body, callback) {
    var cartId = body.cartId;

    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('cart', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'id': cartId}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                }
                
                var changedAt = moment().format('YYYY-MM-DD hh:mm:ss');
                var date_time = new Date();
                var timestamp = date_time.getTime();
                var str_timestamp = timestamp.toString();

                var updateList = {
                    changedAt: changedAt,
                    timestamp: str_timestamp
                };

                if (body.qty) {
                    updateList.qty = parseFloat(body.qty);
                }

                if (body.comments) {
                    updateList.comments = body.comments;
                }

                if (body.studentList) {
                    updateList.students = body.studentList;
                }

                if (body.options) {
                    updateList.options = body.options;
                }

                var key_query = { id: cartId };
                var value_query = {$set: updateList};

                collection.updateOne(key_query, value_query, function(err, res) {
                    if (err) {
                        return callback(err);
                    }
                    return callback(null, res);
                });
               
                client.close();
            });

           
        });
    });
}

exports.get_cart_info = function (body, callback) {
    var parentId = body.parentId;

    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('cart').aggregate([
            { 
                $match: {
                        'parentId': parentId,
                        'status': 'enabled'
                    }
            },
            { 
                $lookup: {
                    from: 'product',
                    localField: 'productId',
                    foreignField: 'id',
                    as: 'productInfo'
                }
            },
            { 
                $lookup: {
                    from: 'student',
                    localField: 'students.id',
                    foreignField: 'id',
                    as: 'studentList'
                }
            },
            { 
                $lookup: {
                    from: 'school',
                    localField: 'schoolId',
                    foreignField: 'id',
                    as: 'schoolInfo'
                }
            }
        ]).toArray(function(err, items) {
            if (err) {
                return callback(err);
                client.close();
            }

            if(items.length == 0){
                return callback(null, {
                    total_amount:0,
                    cart_info:[]
                });
                client.close();
            }

            var total_amount = 0;
            for(var i=0; i<items.length; i++) {
                var options_price = 0;
                for(var j=0; j<items[i].productInfo[0].options.length; j++) {
                    options_price += parseFloat(items[i].productInfo[0].options[j].price);
                }
                items[i].amount = (parseFloat(items[i].productInfo[0].price) + options_price) * parseFloat(items[i].students.length) * parseFloat(items[i].qty);
                total_amount += parseFloat(items[i].amount);
            }
            return callback(null, {cart_info:items, total_amount:total_amount});
        });    
    });
}
exports.empty_cart = function (body,callback) {
    var parentId = body.parentId;
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('cart', function (err, collection) {
            collection.deleteMany({"parentId" : parentId});
            return callback(null);
            client.close();
        });
    });
}

exports.remove_cart_info_by_id = function (body,callback) {
    var cartId = body.cartId;
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('cart', function (err, collection) {
            collection.deleteOne({
                id: cartId
            }, function(err, res) {
                if (err) return callback(err);
            });
            return callback(null);
            client.close();
        });
    });
}
