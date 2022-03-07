var LocalStrategy = require('passport-local').Strategy;
/*var User = require('../models/user');*/
var User = require('../src/user/usermodel');
var bcrypt = require('bcryptjs');
const flash = require('connect-flash');


module.exports = function (passport) {

    /*passport.use(new LocalStrategy(function (username, password, done) {*/
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        session: false,
    },
        function (email, password, done) {

            User.findOne({ email: email }, function (err, email) {
            if (err)
                console.log(err);

                if (!email) {
                    console.log("this part email cannot find");
                   
                    return done(null, false, { message: 'No user found!' });
               
            }
                if (email) {
                    bcrypt.compare(password, email.password, function (err, isMatch) {
                        if (err)
                            console.log(err);
                        console.log("this part");
                        if (isMatch) {
                            return done(null, email);
                            console.log("reach this part here");
                        } if (!isMatch) {
                            return done(null, false, { message: 'Wrong password.' });
                            console.log("reach here");
                        }
                    });
                }
        });

    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

}
//var LocalStrategy = require('passport-local').Strategy;
//var User = require('../models/user');
//var bcrypt = require('bcryptjs');

//module.exports = function (passport) {

//    passport.use(new LocalStrategy(function (username, password, done) {

//        User.findOne({ username: username }, function (err, user) {
//            if (err)
//                console.log(err);

//            if (!user) {
//                return done(null, false, { message: 'No user found!' });
//            }

//            bcrypt.compare(password, user.password, function (err, isMatch) {
//                if (err)
//                    console.log(err);

//                if (isMatch) {
//                    return done(null, user);
//                } else {
//                    return done(null, false, { message: 'Wrong password.' });
//                }
//            });
//        });

//    }));

//    passport.serializeUser(function (user, done) {
//        done(null, user.id);
//    });

//    passport.deserializeUser(function (id, done) {
//        User.findById(id, function (err, user) {
//            done(err, user);
//        });
//    });

//}