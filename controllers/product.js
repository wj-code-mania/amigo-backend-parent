var productModel = require('../models/product');

exports.getCanteenList = function(req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    body.parentCategory = 'Canteen';

    productModel.get_product_list(body, function(err, data) {
        if (err) {
            var resp = {
                code: 401,
                msg: err,
                data: null
            };
            return res.json(resp);
        }
        
        if (!data){
            var resp = {
                code: 200,
                msg: 'Failed',
                data: null
            };
        } else {
            var resp = {
                code: 200,
                msg: 'Success',
                product_list : data
            };
        }
        return res.json(resp);
    });
}

exports.getUniformList = function(req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    body.parentCategory = 'Uniform';

    productModel.get_product_list(body, function(err, data) {
        if (err) {
            var resp = {
                code: 401,
                msg: 'Failed',
                data: null
            };
            return res.json(resp);
        }
        
        if (!data){
            var resp = {
                code: 200,
                msg: 'Failed',
                data: null
            };
        } else {
            var resp = {
                code: 200,
                msg: 'Success',
                product_list : data
            };
        }
        return res.json(resp);
    });
}

exports.getProductsCntInfo = function(req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    productModel.get_products_cnt_info(body, function(err, data) {
        if (err)
            return next(new Error('Failed to get orders table: \n' + err));
        return res.json({code: 200, products_cnt_info: data});
    })
}

exports.getProductIdInfo = function(req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    productModel.get_productid_info(body, function(err, data) {
        if (err)
            return next(new Error('Failed to get orders table: \n' + err));
        return res.json({code: 200, productid_info: data});
    })
}