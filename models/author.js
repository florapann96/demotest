var mongoose = require('mongoose');

// Category Schema
var AuthorSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    contact: {
        type: Number
    },
    socialname: {
        type: String
    },
        social: {
        type: String
    }
   
});

var Author = module.exports = mongoose.model('Author', AuthorSchema);