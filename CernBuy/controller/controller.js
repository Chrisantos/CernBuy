const cloudinary = require('cloudinary');
const postModel = require('./model/postSchema');
const userModel = require('./model/userSchema');
const adminModel = require('./model/adminSchema');
const cartModel = require('./model/cartSchema');

cloudinary.config({
    cloud_name: 'cernetics',
    api_key: '276336719369831',
    api_secret: 'CoPW3VJsVSTg8w3z-qsLLs4UX_4'
});

module.exports = {
    index: (req, res) =>{
        let query = req.query.q;
        if(query){
            if(req.usersession.user){
                postModel.find({$or: [{title: query}, {image_id: query}, {price: query}, {tag: query}]} , (err, posts) =>{
                    if(err) res.send(err);
        
                    res.render('pages/index', {posts: posts, user: user, num: req.usersession.user.cart_item});
                });
            }else{
                postModel.find({$or: [{title: query}, {image_id: query}, {price: query}, {tag: query}]} , (err, posts) =>{
                    if(err) res.send(err);
        
                    res.render('pages/index', {posts: posts, user: null});
                });
            }
        }else{
            if(req.usersession.user){
                postModel.find({}, (err, posts) =>{
                    if(err) res.send(err);
                    else{
                        userModel.findOne({handle: req.usersession.user.handle}, (err, user) =>{
                            if(err) res.send(err);

                            res.render('pages/index', {posts: posts, user: user, num: req.usersession.user.cart_item});
                        })
                    }
                });
            }else{
                postModel.find({}, (err, posts) =>{
                    if(err) res.send(err);
        
                    res.render('pages/index', {posts: posts, user: null});
                });
            }
            
        }
        
    },

    about: (req, res) =>{
        res.render('pages/about');
    },

    viewItem: (req, res) =>{
        let id = req.body.image_id;
        postModel.findOne({image_id: id}, (err, post) =>{
            if(err) res.send(err);

            res.render('pages/view', {post: post});
        });
    },
    
    signin: (req, res) =>{
        res.render('pages/login');
    },

    login: (req, res) =>{
        let handle = req.body.handle;
        let password = req.body.password;

        userModel.findOne({handle: handle}, (err, user) =>{
            if(err) res.send(err);
            else if(user){
                if(password !== user.password){
                    res.render("pages/signin", {error: "Password does not match"});
                } else{
                    req.usersession.user = user;
                    console.log(req.usersession.user);
                    res.redirect('/');
                }
            }else{
                res.render('pages/login');
            }
            
        });
    },

    signup: (req, res) =>{
        res.render('pages/signup');
    },

    register: (req, res) =>{
        let handle = req.body.handle;
        let password = req.body.password;

        userModel.findOne({handle: handle}, (err, user) =>{
            if(err) res.send(err);
            else if(user){
                res.render("pages/signup", {error: "User already exists!"});                
            } else{
                let newUser = new userModel({
                    handle: handle,
                    password: password,
                    cart_item: 0
                });

                newUser.save((err) =>{
                    if(err) res.send(err);
                    else{
                        req.usersession.user = newUser;
                        console.log(req.usersession.user);
                        res.redirect('/');
                    }
                });
            }
        });
    },

    logout: (req, res) =>{
        req.usersession.user = null;
        res.redirect('/');
    },

    addCart: (req, res) =>{
        let handle = req.usersession.user.handle;
        let imageId = req.params.id;
        let query = req.body.query;

        postModel.findOne({image_id: imageId}, (err, post) =>{
            if(err) res.send(err);
            else{
                let newCart = new cartModel({
                    handle:         handle,
                    tag:            post.tag,
                    title:          post.title,
                    description:    post.description,
                    price:          post.price,
                    quantity:       post.quantity,
                    image_url:      post.image_url,
                    image_id:       post.image_id,
                    width:          post.width,
                    height:         post.height,
                    created_at:     post.created_at
                });

                newCart.save((err) =>{
                    if(err) res.send(err);
                    else{
                        userModel.findOne({handle: handle}, (err, user) =>{
                            if(err) res.send(err);
                            else{
                                userModel.findOneAndUpdate({handle: handle}, 
                                {
                                    handle: handle,
                                    password: user.password,
                                    cart_item: user.cart_item + 1
                                }, (err) =>{
                                    if(err) res.send(err);
                                    else{
                                        req.usersession.user = user;
                                        cartModel.find({handle: handle}, (err, carts) =>{
                                            if(err) res.send(err);
                                            else{
                                                if(query){
                                                    postModel.findOne({$or: [{title: query}, {image_id: query}, {price: query}, {tag: query}]} , (err, postM) =>{
                                                        if(err) res.send(err);
                                                        else{
                                                            res.render('pages/cart', {post: post, user: user, carts: carts, num: req.usersession.user.cart_item});                                            
                                                            
                                                        }
                                                    });
                                        
                                                }else{
                                                    res.render('pages/cart', {post: post, user: user, carts: carts, num: req.usersession.user.cart_item});                                            
                                        
                                                }
                                            }

                                        });

                                    }
                                });     
                            }
                        });
                        
                    }
                    
                });
            }
        });
    },

    cart: (req, res) =>{
        let handle = req.usersession.user.handle;
        let query = req.body.query;
        if(query){
            postModel.findOne({$or: [{title: query}, {image_id: query}, {price: query}, {tag: query}]} , (err, post) =>{
                if(err) res.send(err);
                else{
                    userModel.findOne({handle: handle}, (err, user) =>{
                        if(err) res.send(err);
                        else{
                            cartModel.find({handle: handle}, (err, carts) =>{
                                if(err) res.send(err);
            
                                res.render('pages/cart', {post: post, user: user, carts: carts, num: req.usersession.user.cart_item});
                            });
                        }
                    });
                }
            });

        }else{
            //Unfinished task: the title and price of the item clicked should appear on this page, get it from the post collection
            userModel.findOne({handle: handle}, (err, user) =>{
                if(err) res.send(err);
                else{
                    cartModel.find({handle: handle}, (err, carts) =>{
                        if(err) res.send(err);
    
                        res.render('pages/cart', {user: user, carts: carts, num: req.usersession.user.cart_item});
                    });
                }
            });

        }
       
    },

    itemTag: (req, res) =>{
        let tag = req.params.tag;
        postModel.find({tag: tag}, (err, posts) =>{
            if(err) res.send(err);

            res.render('pages/tag', {posts: posts});            
        });

    },

    find: (req, res) =>{
        let id = req.params.id;
        postModel.findOne({image_id: id}, (err, post) =>{
            if(err) res.send(err);

            res.render('pages/single', {post: post, image: cloudinary.image, image_url: cloudinary.url});            
        })
    },

    admin: {
        index: (req, res) =>{
            let query = req.query.q;
            if(query){
                postModel.find({$or: [{title: query}, {image_id: query}, {price: query}, {tag: query}]} , (err, posts) =>{
                    if(err) res.send(err);
        
                    res.render('pages/index', {posts: posts, searchValue: query});
                });
            }else{
                postModel.find({}, (err, posts) =>{
                    if(err) res.send(err);
        
                    res.render('admin/index', {posts: posts});
                });
            }
                
        },

        // index: (req, res) =>{
        //     let query = req.query.q;
        //     let callback = (result) =>{
        //         let searchValue = '';
        //         if(query){
        //             searchValue = query;
        //         }
        //         res.render('admin/index',{posts: result.resources, searchValue: searchValue});
        //     };
        //     if(query){
        //         cloudinary.api.resources(callback, {type: 'upload', prefix: query});
        //     } else{
        //         cloudinary.api.resources(callback);
        //     }
        // },

        new: (req, res) => {
            res.render('admin/new');
        },

        signin: (req, res) =>{
            res.render('admin/login');
        },

        login: (req, res) =>{
            let handle = req.body.handle;
            let password = req.body.password;
            adminModel.findOne({handle: handle}, (err, admin) =>{
                if(err) res.send(err);
                else if(password !== admin.password){
                    res.render("admin/login", {error: "Password does not match"});
                } else{
                    req.adminsession.user = admin;
                    console.log(req.adminsession.user);
                    res.redirect('/admin');
                }
            });
        },

        signup: (req, res) =>{
            res.render('admin/signup');
        },
    
        register: (req, res) =>{
            let handle = req.body.handle;
            let password = req.body.password;
    
            adminModel.findOne({handle: handle}, (err, admin) =>{
                if(err) res.send(err);
                else if(admin){
                    res.render("admin/signup", {error: "Error in handle"});                
                } else{
                    let newAdmin = new adminModel({
                        handle: handle,
                        password: password
                    });
    
                    newAdmin.save((err) =>{
                        if(err) res.send(err);
                        else{
                            req.adminsession.user = newAdmin;
                            console.log(req.adminsession.user);
                            res.redirect('/admin');
                        }
                    });
                }
            });
        },

        create: (req, res) =>{
            let tag = req.body.tag;
            let title = req.body.title;
            let description = req.body.description;
            let price = req.body.price;
            let quantity = req.body.quantity;
    
            cloudinary.uploader.upload(req.files.image.path, 
            function(result) {
                let post = new postModel({
                    tag:            tag,
                    title:          title,
                    description:    description,
                    price:          price,
                    quantity:       quantity,
                    image_url:      result.url,
                    image_id:       result.public_id,
                    width:          result.width,
                    height:         result.height,
                    created_at:     new Date(),
                    available: true
                });
    
                post.save((err) =>{
                    if(err) res.send(err);
                    else{
                        res.redirect('/admin');
                    }
                });
            });
        },
    

        edit: (req, res) =>{
            let id = req.params.id;
            postModel.find({image_id: id}, (err, posts) =>{
                if(err) res.send(err);

                res.render("admin/edit", {post: posts[0]});
            });
        },

        update: (req, res) =>{
            let oldId = req.body.old_id;
            let newId = req.body.new_id;
            cloudinary.v2.uploader.rename(oldId, newId, 
            function(error, result) {
                if(error) res.send(error);

                postModel.findOneAndUpdate({image_id: oldId}, 
                Object.assign({}, req.body, {image_url: result.url}), function(err) {
                    if(err) res.send(err);

                    res.redirect('/admin');
                });
            });
        },

        delete: (req, res) =>{
            let imageId = req.body.image_id;
            cloudinary.v2.uploader.destroy(imageId, function(error, result) {
                if(error) res.send(error);

                postModel.findOneAndRemove({image_id: imageId}, (err) =>{
                    if(err) res.send(err);

                    res.redirect('/admin');
                });
            });
        },

        listUsers: (req, res) =>{
            userModel.find().sort({handle: 1}).exec((err, users) =>{
                if(err) res.send(err);
                
                res.render('admin/list_users', {users: users});
            });
        },

        listCarts: (req, res) =>{
            cartModel.find().sort({tag: 1}).exec((err, carts) =>{
                if(err) res.send(err);

                res.render('admin/list_carts', {carts: carts});
            });
        },

        logout: (req, res) =>{
            req.adminsession.user = null;
            res.redirect('/admin/signin');
        },
    }

}