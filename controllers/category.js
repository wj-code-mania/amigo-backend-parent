var categoryModel = require('../models/category');

exports.getCategoryList = function(req, res, next) {
    const body = req.body;
    categoryModel.get_category_list(body, function(err, data) {
        if (err)
            return next(new Error('Failed to get orders table: \n' + err));
        return res.json({code: 200, category_list: data});
    })
}

exports.getCategoriesCnt = function(req, res, next) {
    const body = req.body;
    categoryModel.get_categories_cnt(body, function(err, data) {
        if (err)
            return next(new Error('Failed to get orders table: \n' + err));
        return res.json({code: 200, categories_cnt: data});
    })
}