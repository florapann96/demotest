var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var isUser = auth.isUser;

// Get Product model
/*var User = require('../models/user')*/
var User = require('../src/user/usermodel');
var Product = require('../models/product');
var Cart = require('../models/cart');
/*
 * GET add product to cart
 */
//router.get('/add/:product', function (req, res) {

//    var slug = req.params.product;

//    Product.findOne({ slug: slug }, function (err, p) {
//        if (err)
//            console.log(err);

//        if (typeof req.session.cart == "undefined") {
//            req.session.cart = [];
//            req.session.cart.push({
//                title: slug,
//                qty: 1,
//                price: parseFloat(p.price).toFixed(2),
//                image: '/product_images/' + p._id + '/' + p.image
//            });
//        } else {
//            var cart = req.session.cart;
//            var newItem = true;

//            for (var i = 0; i < cart.length; i++) {
//                if (cart[i].title == slug) {
//                    cart[i].qty++;
//                    newItem = false;
//                    break;
//                }
//            }

//            if (newItem) {
//                cart.push({
//                    title: slug,
//                    qty: 1,
//                    price: parseFloat(p.price).toFixed(2),
//                    image: '/product_images/' + p._id + '/' + p.image
//                });

//            }
//        }

//        //        console.log(req.session.cart);
//        req.flash('success', 'Product added!');
//        res.redirect('back');
//    });

//});
router.post('/add/:id', function (req, res) {
    var slug = req.params.product;
   
       Product.findById({ _id: req.params.id }, function (err, foundProduct) {
            if (err) {
                console.log(err);
            }
            if (typeof req.session.cart != "undefined") {
                const product = {
                    item: foundProduct._id,
                    qty: 1,
                    title: foundProduct.title,
                    image: foundProduct.image,
                    category: foundProduct.category

                }

                var cart = new Cart({

                    owner: req.user._id,
                    items: product

                });


                cart.save(function (err) {
                    if (err) throw err;
                    console.log("item added");
                   
                });

            } else {


                var newItem = true;
                    
                    Cart.findOne({ owner:req.user.id,items: { $elemMatch: { title: foundProduct.title } } }, function (err, p) {
                        if (err) {
                            console.log(err);
                        }
                        if (p) {
                            var myStringArray = p.items;
                            var arrayLength = myStringArray.length;
                            for (var i = 0; i < arrayLength; i++) {
                                console.log(myStringArray[i].title);

                                console.log('this item is already exist');
                                newItem = false;
                                break;
                                

                            }
                        }
                        if (!p) {
                            if (typeof req.session.cart == "undefined") {
                                const product = {
                                    item: foundProduct._id,
                                    qty: 1,
                                    title: foundProduct.title,
                                    image: foundProduct.image,
                                    category: foundProduct.category

                                }

                                var cart = new Cart({

                                    owner: req.user._id,
                                    items: product

                                });
                               
                                    
                                
                                cart.save(function (err) {
                                    if (err) throw err;
                                    console.log("item added");
                                  
                                    
                                });
                            }
                        }
                    });
               
              
           }
          
        });
    
    res.redirect("/products");
    req.flash('item added');
    });

router.get("/checkout", function (req, res) {
    Cart.find({ owner: req.user._id }, function (err, cart) {
        if (err) {
            console.log(err);
        }

        res.render("checkout", { cart: cart });
        req.app.locals.cart = cart;
        
      
    })
  
})




/*
 * GET update product
 */
router.get('/update/:id', function (req, res) {
 
    Cart.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Cart.find(function (err, cart) {
            if (err) {
                console.log(err);
            } else {
                req.flash('success', 'Cart item deleted!');
                res.redirect('/checkout');
            }
        });
            
        
    

    });
});

/*
 * GET clear cart
 */
router.get('/clear', function (req, res) {

    delete req.session.cart;

    req.flash('success', 'Cart cleared!');
    res.redirect('/checkout');

});

/*
 * GET buy now
 */
router.get('/buynow', function (req, res) {

    delete req.session.cart;

    res.sendStatus(200);

});

// Exports
module.exports = router;