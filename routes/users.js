var express = require('express');
var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
var Stripe = require('../public/js/stripe')
var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var flash = require('connect-flash');
// Get Users model
var User = require('../src/user/usermodel');
const UserService = require('../src/user/index')
const setCurrentUser = require('../src/middleware/setCurrentUser')
const hasPlan = require('../src/middleware/hasPlan')
var Cart = require('../models/cart');

const productToPriceMap = {
    weekly: 'price_1KTHksCIYWxab9Wx4UdZh10D',
    monthly: 'price_1KTHlLCIYWxab9WxYC2Oz6Y9',
    yearly: 'price_1KWul9CIYWxab9WxfmjjqEnZ'
}

/*
 * GET register
 */
router.get('/register', function (req, res) {

    res.render('register', {
        title: 'Register'
    });

});

/*
 * POST register
 */
//router.post('/register', function (req, res) {

//    var name = req.body.name;
//    var email = req.body.email;
//    var username = req.body.username;
//    var password = req.body.password;
//    var password2 = req.body.password2;

//    req.checkBody('name', 'Name is required!').notEmpty();
//    req.checkBody('email', 'Email is required!').isEmail();
//    req.checkBody('username', 'Username is required!').notEmpty();
//    req.checkBody('password', 'Password is required!').notEmpty();
//    req.checkBody('password2', 'Passwords do not match!').equals(password);

//    var errors = req.validationErrors();

//    if (errors) {
//        res.render('register', {
//            errors: errors,
//            user: null,
//            title: 'Register'
//        });
//    } else {
//        User.findOne({ username: username }, function (err, user) {
//            if (err)
//                console.log(err);

//            if (user) {
//                req.flash('danger', 'Username exists, choose another!');
//                res.redirect('/users/register');
//            } else {
//                var user = new User({
//                    name: name,
//                    email: email,
//                    username: username,
//                    password: password,
//                    admin: 0
//                });

//                bcrypt.genSalt(10, function (err, salt) {
//                    bcrypt.hash(user.password, salt, function (err, hash) {
//                        if (err)
//                            console.log(err);

//                        user.password = hash;

//                        user.save(function (err) {
//                            if (err) {
//                                console.log(err);
//                            } else {
//                                req.flash('success', 'You are now registered!');
//                                res.redirect('/users/login')
//                            }
//                        });
//                    });
//                });
//            }
//        });
//    }

//});

router.post('/register', async function(req, res, next) {

    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(password);

    var errors = req.validationErrors();

    let customer = await UserService.getUserByEmail(email)
    let customerInfo = {}
    if (customer) {
        console.log(`email ${email} exist. please user other email to register `)
        req.flash("email is exist . please use other email to register");
        res.redirect('/users/register');
    }
    if (!customer) {
        console.log(`email ${email} does not exist. Making one. `)

        try {
            customerInfo = await Stripe.addNewCustomer(email)
            customer = new User({
                email: customerInfo.email,
                billingID: customerInfo.id,
                username: username,
                password: password,
                admin: 0,
                plan: 'none',
                endDate: null
                });
            bcrypt.genSalt(10, function (err, salt) {

                bcrypt.hash(customer.password, salt, function (err, hash) {
                    if (err)
                        console.log(err);

                    customer.password = hash;
                    customer.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'You are now registered!');

                            res.redirect('/users/login')
                        }
                    });
                });
            });
            console.log(
                `A new user signed up and addded to DB. The ID for ${email} is ${JSON.stringify(
                    customerInfo
                )}`
            )

            console.log(`User also added to DB. Information from DB: ${customer}`)
        } catch (e) {
            console.log(e)
            res.status(200).json({ e })
            
        }


    }
    
});
/*
 * GET login
 */
//router.get('/login',function (req, res) {

//    if (res.locals.user) res.redirect('/');

//    res.render('login', {
//        title: 'Log in'
//    });

//});
router.get('/login', async function (
    req,
    res,
    next
)

{
    res.status(200).render('login.ejs')
})
/*
 * POST login
 */
router.post('/login', async (req, res, next) =>{

    var email = req.body.email;
    let customer = await UserService.getUserByEmail(email)
    let customerInfo = {}
    console.log(customer);
    if (customer) {
        customerInfo = await Stripe.getCustomerByID(customer.billingID)
        console.log(
            `The existing ID for ${email} is ${JSON.stringify(customerInfo)}`
        )
        req.session.email = customer.email
        console.log(req.session.email);
    }
    passport.authenticate('local', {

        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
   
   
});

router.get('/forget', function (req, res) {
    res.render('forget', {
        email: req.email
    });
});

router.post('/forget', function (req, res, next) {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {

            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail', // se puede usar cualquier otro servicio soportado por nodemailer, see nodemailer support mail SMTP
                auth: {
                    user: 'lighkeepersburma@gmail.com', //email from
                    pass: 'Asd123!@#' //password 
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/users/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/users/forget');
    });
});

router.get('/reset/:token', function (req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/users/forget');
        }
        console.log(user.resetPasswordToken);
        res.render('reset', {
            
            token: user.resetPasswordToken
        });
    });
});

router.post('/reset/:token', function (req, res) {
    
    async.waterfall([
        function (done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                bcrypt.genSalt(10, function (err, salt) {

                    bcrypt.hash(user.password, salt, function (err, hash) {
                        if (err)
                            console.log(err);

                        user.password = hash;
                        user.save(function (err) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.logIn(user, function (err) {
                                    done(err, user);
                                });
                            }
                        });
                    });
                });
                //user.save(function (err) {
                //    req.logIn(user, function (err) {
                //        done(err, user);
                //    });
                //});
            });
        },
        function (user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Gmail',
                auth: {
                    user: 'lighkeepersburma@gmail.com!',
                    pass: 'Asd123!@#'
                }
            });
            console.log('password has been sent');
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });

        }
    ], function (err) {
        res.redirect('/users/login');
    });
});

router.get('/about', (req, res) => {
    
    if (req.isAuthenticated()) {
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;
            res.render('aboutus', {
                cart: cart
            })

        })
    }
    else {

        var cart = { cart: '0' }
        res.locals.cart = cart;
        res.render('aboutus', {
            cart: cart
        })
        console.log('user is not logged in');
    }
    
   
   
})


router.post('/contact', function (req, res, next) {
    var email = req.body.email;
    var message = req.body.message;

    var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
            user: 'lighkeepersburma@gmail.com', //email from
            pass: 'Asd123!@#' //password 
        }
    });
    var mailOptions = {


        to: 'lighkeepersburma@gmail.com', // used as RCPT TO: address for SMTP
        subject: email,
        text: message



    }
    smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success','Thank you for contacting us! An e-mail has been sent to admin');
        res.redirect('/');
    });
    
})
router.get('/plan', async (req, res, next) => {


    let { email } = req.session
    console.log(req.session);
    let customer = await UserService.getUserByEmail(email)
    if (!customer) {
        res.render('plan.ejs', {customer: 'false'})
        console.log(customer)
    } else {
        
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;
            res.render('plan.ejs', { customer , cart})

        });
        
    }


});
router.get('/contact', getproduct, getcart1, renderForm);

function getproduct(req, res, next) {
    // Code here



    next();

};



function getcart1(req, res, next) {
    // Code here
    if (req.isAuthenticated()) {
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;
            console.log(cart)
            next();

        })
    }
    else {

        var cart = { cart: '0' }
        res.locals.cart = cart;
        next();
        console.log('user is not logged in');
    }


};

function renderForm(req, res) {
    res.render("contact");
};

router.post('/checkout', setCurrentUser, async (req, res) => {
    const customer = req.user
    const { product, customerID } = req.body

    const price = productToPriceMap[product]

    try {
        const session = await Stripe.createCheckoutSession(customerID, price)
        
        console.log(session.payment_status)

            customer.plan = product
            customer.hasTrial = false
            customer.endDate = null
        console.log(customer.plan)
        /*customer.save()*/
        res.send({
            sessionId: session.id
        })
        
            
        

        
    } catch (e) {
        console.log(e)
        res.status(400)
        return res.send({
            error: {
                message: e.message
            }
        })
    }
})

router.post('/billing', setCurrentUser, async (req, res) => {
    const { customer } = req.body
    console.log('customer', customer)

    const session = await Stripe.createBillingSession(customer)
    console.log('session', session)

    res.json({ url: session.url })
})
router.post('/webhook', async (req, res) => {
    let event
    const signature = req.headers['stripe-signature'];
    try {
        /*event = Stripe.createWebhook(req.body, req.header('Stripe-Signature'))*/
        event = Stripe.createWebhook(req.body, signature)
    } catch (err) {
        //console.log(signature)
        //console.log(req.body)
        console.log(err)
        return res.sendStatus(400)
    }
   
    const data = event.data.object

    console.log(event.type, data)
    switch (event.type) {
        case 'customer.created':
            console.log(JSON.stringify(data))
            break
        case 'invoice.paid':
            break
        case 'customer.subscription.created': {
            const user = await UserService.getUserByBillingID(data.customer)

            if (data.plan.id === 'price_1KTHksCIYWxab9Wx4UdZh10D') {
                console.log('You are talking about basic product')
                user.plan = 'weekly'
            }

            if (data.plan.id === 'price_1KTHlLCIYWxab9WxYC2Oz6Y9') {
                console.log('You are talking about pro product')
                user.plan = 'monthly'
            }
            if (data.plan.id === 'price_1KWul9CIYWxab9WxfmjjqEnZ') {
                console.log('You are talking about pro product')
                user.plan = 'yearly'
            }

            user.hasTrial = false
            user.endDate = new Date(data.current_period_end * 1000)

            await user.save()

            break
        }
        case 'customer.subscription.updated': {
            // started trial
            const user = await UserService.getUserByBillingID(data.customer)

            if (data.plan.id == 'price_1KTHksCIYWxab9Wx4UdZh10D') {
                console.log('You are talking about weekly product')
                user.plan = 'weekly'
            }

            if (data.plan.id === 'price_1KTHlLCIYWxab9WxYC2Oz6Y9') {
                console.log('You are talking about monthly product')
                user.plan = 'monthly'
            }
            if (data.plan.id === 'price_1KWul9CIYWxab9WxfmjjqEnZ') {
                console.log('You are talking about yearly product')
                user.plan = 'yearly'
            }

            const isOnTrial = data.status === 'trialing'

            if (isOnTrial) {
                user.hasTrial = true
                user.endDate = new Date(data.current_period_end * 1000)
            } else if (data.status === 'active') {
                user.hasTrial = false
                user.endDate = new Date(data.current_period_end * 1000)
            }

            if (data.canceled_at) {
                // cancelled
                console.log('You just canceled the subscription' + data.canceled_at)
                user.plan = 'none'
                user.hasTrial = false
                user.endDate = null
            }
            console.log('actual', user.hasTrial, data.current_period_end, user.plan)

            await user.save()
            console.log('customer changed', JSON.stringify(data))
            break
        }
        case 'customer.subscription.deleted': {

            console.log('You just canceled the subscription' + data.canceled_at)
            user.plan = 'none'
            user.hasTrial = false
            user.endDate = null

            await user.save()
            console.log('customer changed', JSON.stringify(data))
            break
        }
        default:
    }
    res.sendStatus(200)
})
//router.post('/login', async (req, res, next) => {
//    passport.authenticate('local', function (err, user, info) {
//        if (err) { return next(err) }
//        if (!user) {
//            return res.redirect('/users/login')

//        }
//        if (user) {

//        req.logIn(user, function (err) {
            
//            if (err) { return next(err); }
//            req.flash('successfully logged in');
//            res.redirect('/');

//        });
//            }
//    })(req, res, next);
//    //const { email } = req.body
//    //console.log('email', email)
///*    const customer = await Stripe.addNewCustomer(email)*/
//});
//router.post('/login', async (req, res) => {
//    const { email } = req.body
//    console.log('email',email)
//    const customer = await Stripe.addNewCustomer(email)
//    res.send('Customer created: ' + JSON.stringify(customer))
//})
/*
 * GET logout
 */
router.get('/logout', function (req, res) {

    req.logout();
    req.session.destroy();
    /*req.flash('success', 'You are logged out!');*/
    res.redirect('/users/login');

});

// Exports
module.exports = router;

