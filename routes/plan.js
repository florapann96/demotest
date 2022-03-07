var express = require('express');
var router = express.Router();

// Get Page model
var Page = require('../models/page');
var Product = require('../models/product');
var Product1 = require('../models/upcome_product');
var Cart = require('../models/cart');
/*
 * GET /
 */


router.get("/", function (req, res, next) {

    if (req.isAuthenticated()) {

        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.render("plan", { cart: cart });



        })
    }
    else {
        Product1.find(function (err, products) {
            res.render("plan",products);
        });
    }
});


// Exports
module.exports = router;