var classTypeModel = require('../models/class_type');

exports.getClassTypeList = function(req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    classTypeModel.get_class_type_list(body, function(err, data) {
        if (err)
            return next(new Error('Failed to get orders table: \n' + err));
        return res.json({code: 200, class_type_list: data});
    })
}