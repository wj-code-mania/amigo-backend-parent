var settings = require('../config/settings');
var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');

exports.get_class_type_list = function (body, callback) {
    mongoClient.connect(settings.mongodb_host, { useNewUrlParser: true }, function(err, client) {
        if (err) {
            return callback(err);
            client.close();
        }
        assert.equal(null, err);
        var mongodb = client.db(settings.mongodb_dbname);
        mongodb.collection('class_type', function (err, collection) {
            if (err) {
                return callback(err);
                client.close();
            }
            collection.find({'schoolId' : body.schoolId}).toArray(function(err, items) {
                if (err) {
                    return callback(err);
                }
                var return_data = [];
                items.forEach(function(value){
                    if (value.status == 'enabled') {
                        var push_data = {
                            id : value.id,
                            name : value.name
                        }
                        return_data.push(push_data);
                    }
                });
                return callback(null, return_data);
                client.close();
            });
        });
    });
};