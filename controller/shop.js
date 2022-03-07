const Product = require('../models/product');
const Cart = require('../models/cart');

exports.deleteInCart = (req, res, next) => {
    Cart.delete(req.params.id);
    res.redirect('/cart');
}