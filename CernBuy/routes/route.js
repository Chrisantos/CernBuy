const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const bodyParser = require('body-parser');
const controller = require('../controller/controller');
const adminModel = require('../controller/model/adminSchema');
const userModel = require('../controller/model/userSchema');

const cookieParser = require('cookie-parser');
const session = require('client-sessions');

module.exports = (app) =>{
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser());
    app.use(session({
        cookieName: 'adminsession',
        secret: 'abcdefghijk',
        duration: 20*60*1000,
        activeDuration: 5*60*1000
    }));
    app.use(session({
        cookieName: 'usersession',
        secret: 'abcdefghij',
        duration: 20*60*1000,
        activeDuration: 5*60*1000
    }));

    // middleware function to check for logged-in users
    let adminSessionChecker = (req, res, next) =>{
        if(!req.adminsession.user){
            res.redirect('/admin/signin');
        } else{
            adminModel.findOne({handle: req.adminsession.user.handle}, (err, admin) =>{
                if(err){
                    res.redirect('/admin/signin');
                }
                else if(admin === null){
                    res.redirect('/admin/signin');
                }
                else if(req.adminsession.user.password !== admin.password){
                    res.render('admin/signin', {error: 'Some details have changed since last login, please verify your login details'});
                }
                else{
                    next();
                }
            });
        }
    }

    let userSessionChecker = (req, res, next) =>{
        if(!req.usersession.user){
            res.redirect('/login');
        } else{
            userModel.findOne({handle: req.usersession.user.handle}, (err, user) =>{
                if(err){
                    res.redirect('/login');
                }
                else if(user === null){
                    res.redirect('/login');
                }
                else if(req.usersession.user.password !== user.password){
                    res.render('pages/login', {error: 'Some details have changed since last login, please verify your login details'});
                }
                else{
                    next();
                }
            });
        }
    }
    

    app.get('/', controller.index);
    app.get('/admin/new', adminSessionChecker, controller.admin.new);
    app.get('/about', controller.about);
    app.get('/login', controller.signin);
    app.get('/signup', controller.signup);
    app.get('/admin', adminSessionChecker, controller.admin.index);
    app.get('/admin/signin', controller.admin.signin);
    app.get('/admin/signup', controller.admin.signup);
    app.get('/admin/edit/:id', adminSessionChecker, controller.admin.edit);
    app.get('/tag/:tag', controller.itemTag);
    app.get('/cart', userSessionChecker, controller.cart);
    app.get('/add-to-cart/:id', userSessionChecker, controller.addCart);
    app.get('/logout', userSessionChecker, controller.logout);
    app.get('/admin/list-users', adminSessionChecker, controller.admin.listUsers);
    app.get('/admin/list-carts', adminSessionChecker, controller.admin.listCarts);
    app.get('/admin/logout', adminSessionChecker, controller.admin.logout);

    app.post('/admin/destroy', controller.admin.delete);
    app.post('/update', controller.admin.update);
    app.post('/register', controller.register);
    app.post('/login', controller.login);
    app.post('/admin/login', controller.admin.login);
    app.post('/admin/register', controller.admin.register);
    app.post('/admin/create', multipartMiddleware, controller.admin.create);
    app.post('/view-item', controller.viewItem);
    // app.post('/add-to-cart', userSessionChecker, controller.addCart);
};