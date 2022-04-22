var express = require('express');
var router = express.Router();

// Get Page model
var Page = require('../models/page');
var Product = require('../models/product');
var Product1 = require('../models/upcome_product');
var Cart = require('../models/cart');
var auth = require('../config/auth');
var isUser = auth.isUser;
/*
 * GET /
 */
//router.get('/', function (req, res) {

//    Product.find({
//        "$or": [{
//            "priority": 1
//        }, {
//            "priority": 2
//        }, {
//            "priority": 3
//        },
//        {
//            "priority": 4
//        },
//        {
//            "priority": 5
//        }
//        ]
//    }, function (err, products) {
//        if (err)
//            console.log(err);

//        res.render('excit', {
//            title: 'Exciting Books',
//            products: products
//        });
//    });

//});
//router.get('/', function (req, res) {
//    Product.find({
//        "$or": [{
//            "rating": 5
//        }, {
//            "rating": 4
//        }, {
//            "rating": 3
//        }

//        ]
//    }, function (err, products) {
//        if (err)
//            console.log(err);

//        res.render('top', {
//            title: 'Top Choice Books',
//            products: products
//        });
//    });
//});

router.get('/', getexcit, gettop,getupcome, getcart,renderForm);

function getexcit(req, res, next) {
    // Code here
    Product.find({
        "$or": [{
            "priority": 1
        }, {
            "priority": 2
        }, {
            "priority": 3
        },
        {
            "priority": 4
        },
        {
            "priority": 5
        }
        ]
    }, function (err, products) {
        if (err)
            console.log(err);

        res.locals.savedexcit = products;
        next();
    });
};

function gettop(req, res, next) {
    // Code here
    Product.find({
        "$or": [{
            "rating": 5
        }, {
            "rating": 4
        }, {
            "rating": 3
        }

        ]
    }, function (err, products) {
        if (err)
            console.log(err);

        res.locals.savedtop = products;
        next();
    });
};
function getupcome(req, res, next) {
    // Code here
    Product1.find(function (err, products) {
        if (err)
            console.log(err);
        products.forEach(function (test){

            /*console.log(test.publishdate);*/
            const str = test.publishdate;
            const result = str.toString().substring(4, 15);;
            
        });

        
        res.locals.savedupcome = products;
        next();
    });
};

function getcart(req, res, next) {

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
    res.render("excit");
};

// Exports
module.exports = router;