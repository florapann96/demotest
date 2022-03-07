var mongoose = require('mongoose');

// User Schema
var UsermodelSchema = mongoose.Schema({

    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Number
    },
    billingID: {
        type: String
    },
    plan: { type: String, enum: ['none', 'weekly', 'monthly', 'yearly'], default: 'none' },
    hasTrial: { type: Boolean, default: false },
    endDate: { type: Date, default: null },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date }

});

var Usermodel = module.exports = mongoose.model('User1', UsermodelSchema);
module.exports = Usermodel