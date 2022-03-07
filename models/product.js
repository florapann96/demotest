var mongoose = require('mongoose');

// Product Schema
var ProductSchema = mongoose.Schema({

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
    author: {
        type: String,     
    },
    totalpage: {
        type: Number,
        
    },
    status: {
        type: String,
        
    },
    category: {
        type: String,
        required: true
    }, price: {
        type: Number,
        required: true
    },
    priority: {
        type: Number

    },
    rating: {
        type: Number
    },

    image: {
        type: String
    },
    pdf: {
        type: String
    }

});

var Product = module.exports = mongoose.model('Product', ProductSchema);