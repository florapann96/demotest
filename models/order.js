var mongoose = require('mongoose');

// User Schema
var CartSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    price: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    }

});

var Cart = module.exports = mongoose.model('Cart', CartSchema);