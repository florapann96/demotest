var mongoose = require('mongoose');

// User Schema
var CartSchema = mongoose.Schema({

    owner: { type: mongoose.Schema.Types.ObjectID, ref: 'User' },
    totalPrice: { type: Number, default: 0 },
    items: [{
        item: { type: mongoose.Schema.Types.ObjectID, ref: 'Product' },
        price: { type: Number, default: 0 },
        title: { type: String },
        image: { type: String },
        category: {type: String}
     
    }]

});

var Cart = module.exports = mongoose.model('Cart', CartSchema);