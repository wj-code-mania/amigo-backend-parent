var authService = require('../controllers/auth');

// parent
var parentController = require('../controllers/parent');
var schoolController = require('../controllers/school');
var categoryController = require('../controllers/category');
var productController = require('../controllers/product');
var studentController = require('../controllers/student');
var cartController = require('../controllers/cart');
var classTypeController = require('../controllers/class_type');

function serverRoutes(app){
    
    app.post('/login', parentController.login);
    app.get('/login', parentController.login);
    app.get('/logout', parentController.logout);
    app.post('/register_user', parentController.registerUser);
    app.post('/resend_activation_code', parentController.resendActivationCode);
    app.post('/activate_account', parentController.activateAccount);
    app.post('/activate_user', authService.verifyToken, parentController.activateUser);

    app.get('/get_school_list', schoolController.getSchoolList);
    app.post('/get_category_list', authService.verifyToken, categoryController.getCategoryList);
    app.post('/get_canteen_list', authService.verifyToken, productController.getCanteenList);
    app.post('/get_uniform_list', authService.verifyToken, productController.getUniformList);
    app.post('/get_products_cnt_info', authService.verifyToken, productController.getProductsCntInfo);
    app.post('/get_productid_info', authService.verifyToken, productController.getProductIdInfo);
    app.post('/get_student_list', authService.verifyToken, studentController.getStudentList);
    app.post('/add_to_cart', authService.verifyToken, cartController.addToCart);
    app.post('/get_cart_info', authService.verifyToken, cartController.getCartInfo);
    app.post('/empty_cart', authService.verifyToken, cartController.emptyCart);
    app.post('/remove_cart_info_by_id', authService.verifyToken, cartController.removeCartInfoById);
    app.post('/get_class_type_list', authService.verifyToken, classTypeController.getClassTypeList);
    app.post('/update_cart_info', authService.verifyToken, cartController.updateCartInfo);
}

module.exports = serverRoutes;
