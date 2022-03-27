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
var Art = require('../models/art');

// Get Category model
var Author = require('../models/author');
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
router.get('/', getart,getcart1,renderForm);

function getart(req, res, next) {
    // Code here
    Author.find(function (err, author) {
      
        if (err)
            console.log(err);

        res.locals.savedauthor = author;
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
    res.render("author");
};



/*
 * GET products by category
 */
router.get('/:author', function (req, res) {

    var authorSlug = req.params.author;
   
    Author.findOne({ author: authorSlug }, function (err, c) {
        
        Art.find({ author: authorSlug }, function (err, art) {
            if (err)
                console.log(err);

           console.log(art.author)
            res.render('art_images', {
                
                art: art
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


//router.get('/:author', function (req, res) {

//    var galleryImages = null;
//    var loggedIn = (req.isAuthenticated()) ? true : false;

//    Art.findOne({ title: req.params.author }, function (err, art) {
//        if (err) {
//            console.log(err);
//        } else {
//            console.log(req.params.art)
//            var galleryDir = 'public/art_images/' + art._id;
//            console.log(galleryDir)

//            fs.readdir(galleryDir, function (err, files) {
//                if (err) {
//                    console.log(err);
//                } else {
//                    galleryImages = files;

//                    res.render('art_images', {
//                        title: art.title,
//                        art: art,
//                        galleryImages: galleryImages,
//                        loggedIn: loggedIn
                        
//                    });
//                }
//            });
//        }
//    });


//    if (req.isAuthenticated()) {
//        Cart.find({ owner: req.user._id }, function (err, cart) {
//            if (err) {
//                console.log(err);
//            }

//            res.locals.cart = cart;
            
//        });
        
//        User.find(function (err, user) {

//            if (err)
//                console.log(err);
//            res.locals.saveduser = user;
//           console.log(user)

//        });
//    }
//    else {

//        var cart = { cart: '0' }
//        res.locals.cart = cart;
//        console.log(cart);
//        console.log('user is not logged in');
//    }
//});

// Exports
module.exports = router;