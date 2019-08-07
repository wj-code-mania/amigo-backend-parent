var schoolModel = require('../models/school');

exports.getSchoolList = function(req, res, next) {
    const body = req.body;
    schoolModel.get_school_list(body, function(err, data) {
        if (err)
            return next(new Error('Failed to get orders table: \n' + err));
        return res.json({code: 200, school_list: data});
    })
}