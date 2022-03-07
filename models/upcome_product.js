var mongoose = require('mongoose');

// Product Schema
var Upcome_ProductSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    totalpage: {
        type: Number
      
    },
    publishdate: {
        type: String,
        required: true

    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String
    }

});

var Upcome_Product = module.exports = mongoose.model('Upcome_Product', Upcome_ProductSchema);