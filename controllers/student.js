var studentModel = require('../models/student');

exports.getStudentList = function(req, res, next) {
    const body = req.method == 'GET' ? req.query : req.body;
    if (body.parentId) {
        studentModel.get_student_list(body, function(err, data) {
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
                    data: {
                        student_list : data
                    }
                };
            }
            return res.json(resp);
        });
    } else {
        var err = new Error('Wrong params.');
        err.status = 400;
        return next(err);
    } 
}

exports.getStudentsCount = function(req, res, next) {
    body = req.body;
    studentModel.get_students_count(body, function(err, data) {
        if (err)
            return res.json({code: 500, msg: err});
        return res.json({code: 200, students_count: data});
    })
    return;
}