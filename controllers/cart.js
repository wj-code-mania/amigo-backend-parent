var cartModel = require('../models/cart');

exports.addToCart = function (req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;

    if (body.productId && body.studentList && body.qty && body.options && body.parentId && body.bookingDate) {
        cartModel.add_to_cart(body, function (err, data) {
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
            }else{
                if(data.err == true)
                {
                    var resp = {
                        code: 200,
                        msg: data.msg
                    };
                    return res.json(resp);
                };
                var resp = {
                    code: 200,
                    msg: 'Success',
                };
            }
            return res.json(resp);
        })
    }else {
        var err = new Error('Wrong Input Cart Info.');
        err.status = 400;
        return next(err);
    }    
};

exports.getCartInfo = function (req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;

    if (body.parentId) {
        cartModel.get_cart_info(body, function(err, data) {
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
                    data: data
                };
            }
            return res.json(resp);
        });
    } else {
        var err = new Error('Wrong params.');
        err.status = 400;
        return next(err);
    } 
};
exports.emptyCart = function (req, res, next) {
    var body = req.method == 'GET' ? req.query : req.body;
    
    cartModel.empty_cart(body, function(err, data) {
        if (err)
            return next(new Error(err));
        var resp = {
            code: 200,
            msg: 'Success'
        };

        return res.json(resp);
    })
    return;
};

exports.removeCartInfoById = function (req, res, next) {
    var body = req.method == 'GET' ? req.query : req.body;
    
    cartModel.remove_cart_info_by_id(body, function(err, data) {
        if (err)
            return next(new Error(err));
        var resp = {
            code: 200,
            msg: 'Success'
        };

        return res.json(resp);
    })
    return;
};
exports.updateCartInfo = function (req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    if (body.cartId && (body.studentList || body.qty || body.options || body.comments)) {
        cartModel.update_cart_info(body, function (err, data) {
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
            }else{    
                var resp = {
                    code: 200,
                    msg: 'Success'
                };
            }
            return res.json(resp);
        })
    } else {
        var resp = {
            code: 400,
            msg: 'Failed',
            data: null
        };
        return res.json(resp);
    }
};