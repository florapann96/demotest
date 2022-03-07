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

router.get("/", function(req, res, next) {

    Cart.find({ owner: req.user._id }, function (err, cart) {
        if (err) {
            console.log(err);
        }

        res.render("plan", { cart: cart });
      


    })
   
});

//router.get("/pay", function (req, res, next) {

//    Cart.find({ owner: req.user._id }, function (err, cart) {
//        if (err) {
//            console.log(err);
//        }

//        res.render("pay", { cart: cart });



//    })

//});


// Exports
module.exports = router;