var settings = require('../config/settings');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var moment = require('moment');
var fs = require('fs');

function makeWeekDayRegexStr(weekday) {
    var result = '';
    for (var i=1; i<=7; i++) {
        if (i == weekday) {
            result += 'Y';
        } else {
            result += '.';
        }
    }

    return result;
}

exports.get_product_list = function (body, callback) {

    var page_date = body.pageDate;
    var start = parseInt(body.start);
    var length = parseInt(body.length);
    var keyword = body.keyword;
    var categoryId = body.categoryId;
    var schoolId = body.schoolId;
    var fromPrice = parseFloat(body.fromPrice);
    var toPrice = parseFloat(body.toPrice);
    var classTypeId = body.classTypeId;
    var parentCategory = body.parentCategory;

    var wd = moment(page_date).weekday();
    var wd_str = makeWeekDayRegexStr(wd);

    classTypeId = !classTypeId ? '0' : classTypeId;

    var matchCondition = {  'schoolId': schoolId,
                            'onDays': { $regex : wd_str },
                            'price' : { $gte : fromPrice, $lte : toPrice }
                        };
    if (categoryId != 0) { matchCondition.categoryId = categoryId }
    if (classTypeId != 0) { matchCondition.onClass = classTypeId }

    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('product').aggregate([
            { 
                $match: matchCondition
            },
            { 
                $match: { 
                    $or: [ 
                        { name: {$regex : keyword, $options: 'i'} }, 
                        { description: {$regex : keyword, $options: 'i'} }
                    ] 
                }
            },
            { 
                $lookup: {
                    from: 'category',
                    localField: 'categoryId',
                    foreignField: 'id',
                    as: 'categoryInfo'
                }
            },
            {
                $match: {
                    categoryInfo: {$elemMatch: {parentCategory : parentCategory}}
                }
            },
            { 
                $skip : start 
            },
            { 
                $limit : length 
            }
        ]).toArray(function(err, items) {
            if (err) {
                return callback(err);
                client.close();
            }

            if(items.length == 0){
                return callback(null, {
                    total:0,
                    data:[]
                });
                client.close();
            }          
            
            var totalCnt = 0;
            mongodb.collection('product').aggregate([
                { 
                    $match: categoryId == 0 ? 
                    {
                        'schoolId': schoolId,
                        'onDays': { $regex : wd_str },
                        'price' : { $gte : fromPrice, $lte : toPrice }
                    } : {
                        'schoolId': schoolId,
                        'categoryId': categoryId,
                        'onDays': { $regex : wd_str },
                        'price' : { $gte : fromPrice, $lte : toPrice }
                    }
                },
                { 
                    $match: { 
                        $or: [ 
                            { name: {$regex:keyword, $options:'i'} }, 
                            { description: {$regex:keyword, $options:'i'} }
                        ] 
                    }
                },
                { 
                    $lookup: {
                        from: 'category',
                        localField: 'categoryId',
                        foreignField: 'id',
                        as: 'categoryInfo'
                    }
                },
                {
                    $match: {
                        categoryInfo: {$elemMatch: {parentCategory : parentCategory}}
                    }
                }
            ]).toArray(function(err, allItems) {
                if (err) {
                    return callback(err);
                }
                totalCnt = allItems.length;

                for (var i=0; i<items.length; i++) {
                    for (var j=0; j<items[i].img.length; j++) {
                        items[i].img[j] = settings.backend_manager_host + items[i].img[j];
                    }
                }
                var result = {
                    total: totalCnt,
                    data: items
                };
                return callback(null, result);
                client.close();
            })
        });
    });
};

exports.get_products_cnt_info = function (body, callback) {
    var schoolId = body.schoolId;
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('product', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({schoolId : schoolId}).toArray(function(err, items) {
                if (err) return callback(err);
                return callback(null, items.length);
                client.close();
            });
        });
    });
};
exports.get_productid_info = function (body, callback) {
    var productId = body.productId;
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('product', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({id : productId}).toArray(function(err, items) {
                if (err) return callback(err);
                return callback(null, items);
                client.close();
            });
        });
    });
};