var settings = require('../config/settings');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

exports.get_student_list = function (body, callback) {
    var parentId = body.parentId;

    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('student').aggregate([
            { 
                $match: {
                    "parentId": parentId
                }
            },
            { $lookup:
                {
                    from: 'school',
                    localField: 'schoolId',
                    foreignField: 'id',
                    as: 'schoolInfo'
                }
            },
            { $lookup:
                {
                    from: 'class',
                    localField: 'classId',
                    foreignField: 'id',
                    as: 'classInfo'
                }
            }
        ]).toArray(function(err, items) {
            if (err) return callback(err);
            if(items.length == 0){
                return callback(null, {
                    total:0,
                    data:[]
                });
            }                
            return callback(null, items);
            client.close();
        });
    });
};

exports.get_students_count = function(body, callback) {
    parentId = parseInt(body.parentId);
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('student', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({parentId:parentId}).toArray(function(err, items) {
                if(err) return callback(err);
                return callback(null, items.length);
                client.close();
            });
        });
    });
}