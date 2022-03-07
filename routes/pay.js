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

//router.get("/", function(req, res, next) {
//    const a = req.body.valueA;
//    Cart.find({ owner: req.user._id }, function (err, cart) {
//        if (err) {
//            console.log(err);
//        }

//        res.render("pay", { valueA: a });
//        console.log(a);


//    })
   
//});
/*
 * GET login
 */


router.get('/:id', isUser , function (req, res) {

    var ValueA = req.params.id;
  
    if (ValueA == 1) {
        res.render('pay',
            {
                valueA: "$1.5",
                plan: "weekly",
                plan1: "week"
            }
        );
    }
    if (ValueA == 5) {

        res.render('pay',
            {
                valueA: "$5",
                plan: "monthly",
                plan1: "month"
            }
        );
    }
    if (ValueA == 70) {

        res.render('pay', {
            valueA: "$70",
            plan: "yearly",
            plan1: "year"
        });
    }
});



// Exports
module.exports = router;