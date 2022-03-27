var mongoose = require('mongoose');

// Product Schema
var ImageSchema = mongoose.Schema({

    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    author: {
        type: String,
        required: true
    },

    image: {
        type: String
    }


});

var Art = module.exports = mongoose.model('Art', ImageSchema);