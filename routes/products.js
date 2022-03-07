var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var isUser = auth.isUser;
var User = require('../src/user/usermodel');
const UserService = require('../src/user/index')
const setCurrentUser = require('../src/middleware/setCurrentUser')
const hasPlan = require('../src/middleware/hasPlan')

// Get Product model
var Product = require('../models/product');

// Get Category model
var Category = require('../models/category');
var User = require('../src/user/usermodel');
/*var User = require('../models/user')*/
var Cart = require('../models/cart');
/*
 * GET all products
 */
//router.get('/', function (req, res) {
//    //router.get('/', isUser, function (req, res) {

//    Product.find(function (err, products) {
//        if (err)
//            console.log(err);

//        res.render('all_products', {
//            title: 'All products',
//            products: products
//        });
//    });

//});
router.get('/', getproduct,getcart1,renderForm);

function getproduct(req, res, next) {
    // Code here
    Product.find(function (err, products) {
      
        if (err)
            console.log(err);

        res.locals.savedproduct = products;
        next();
    });
};



function getcart1(req, res, next) {
    // Code here
    if (req.isAuthenticated()) {
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;

            next();

        })
    }
    else {

        var cart = { cart: '0' }
        res.locals.cart = cart;
        next();
        console.log(cart);
        console.log('user is not logged in');
    }
        

};

function renderForm(req, res) {
    res.render("all_products");
};



/*
 * GET products by category
 */
router.get('/:category', function (req, res) {

    var categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug }, function (err, c) {
        Product.find({ category: categorySlug }, function (err, products) {
            if (err)
                console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });
    if (req.isAuthenticated()) {
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;
        });
    }
    else {

        var cart = { cart: '0' }
        res.locals.cart = cart;
        console.log(cart);
        console.log('user is not logged in');
    }
});

//router.get('/:category', getcategory, getcart, renderForm);

//function getcategory(req, res, next) {

//    var categorySlug = req.params.category;

//    Category.findOne({ slug: categorySlug }, function (err, c) {
//        Product.find({ category: categorySlug }, function (err, products) {
//            if (err)
//                console.log(err);

//            res.locals.savedcategory = products;
//            console.log(products);
//            next();
//        });


//    });

//}
//function getcart(req, res, next) {
//    Cart.find({ owner: req.user._id }, function (err, cart) {
//        if (err) {
//            console.log(err);
//        }

//        res.locals.cart = cart;

//        next();

//    })

//}
//function renderForm(req, res) {
//    res.render("cat_products");
//};

/*
 * GET product details
 */


router.get('/:category/:product', function (req, res) {

    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({ title: req.params.product }, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            console.log(req.params.product)
            var galleryDir = 'public/product_images/' + product._id;
            console.log(galleryDir)

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                        
                    });
                }
            });
        }
    });


    if (req.isAuthenticated()) {
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;
            
        });
        
        User.find(function (err, user) {

            if (err)
                console.log(err);
            res.locals.saveduser = user;
           console.log(user)

        });
    }
    else {

        var cart = { cart: '0' }
        res.locals.cart = cart;
        console.log(cart);
        console.log('user is not logged in');
    }
});

// Exports
module.exports = router;