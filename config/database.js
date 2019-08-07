var mongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var settings = require('../config/settings'); 

var mongodb;
 
// Use connect method to connect to the server
mongoClient.connect(settings.mongodb_host, function(err, client) {
  assert.equal(null, err);
  mongodb = client.db(settings.mongodb_dbname);
  
  client.close();
});

module.exports = mongodb;