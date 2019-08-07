var jwt = require('jsonwebtoken');
var config = require('../config/settings');

exports.verifyToken = function(req, res, next) {
    if(!req.headers.authorization) {
        return res.status(401).send('Unauthorized request')
    }
    let token = (req.headers.authorization.split(' ').length>1)? req.headers.authorization.split(' ')[1] : req.headers.authorization;
    if(token === 'null') {
        return res.status(401).send('Unauthorized request')
    }
    
    let decoded = jwt.decode(token, config.TOKEN_SECRET);
    var currentDateTime = new Date();
    var currentTimeStamp = parseInt(currentDateTime.getTime() / 1000);
    if(decoded.exp < currentTimeStamp){
        return res.json({code: 503, msg: "Session expired"});
    }else{
        let payload = jwt.verify(token, config.TOKEN_SECRET);
        if(!payload) {
            return res.status(401).send('Unauthorized request')
        }
        req.body.parentId = payload.parentId;
        req.body.schoolId = payload.schoolId;
        next()
    }
};