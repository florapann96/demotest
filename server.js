var express = require('express');
var app = express();
/*const stripe = require('stripe')('sk_test_51KSdKRCIYWxab9WxOnKhMjI9TDKC3SR8FKUIXpFifWhJ3OnZvSCkxxLx7vwRTgNoUUWOnsV7XqFLw8AnEavfvGtS00eT8OBuHh');*/
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config/database');
var session = require('express-session');
var expressValidator = require('express-validator');
var MongoStore = require('connect-mongo');

var fileUpload = require('express-fileupload');
var passport = require('passport');
var async = require('async');
var crypto = require('crypto');
var Product = require('./models/product');
var Cart = require('./models/cart');
var User = require('./src/user/usermodel');
var nodemailer = require('nodemailer');
//connect to DB

mongoose.connect(config.database, {

    
    useNewUrlParser: true,
    useUnifiedTopology: false, // commented out currently
});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connected to MongoDB');
})

// Get Page Model
var Page = require('./models/page');


//app.use(bodyParser.json({ limit: '16mb', extended: true }));     // Make sure you add these two lines
//app.use(bodyParser.urlencoded({ limit: '16mb', extended: true }))    //Make sure you add these two lines


app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public')));

//Set global errors variable
app.locals.errors = null;

// Get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function (err, pages) {
    if (err) {
        console.log(err);
    } else {
        app.locals.pages = pages;
    }
});

// Get Category Model
var Category = require('./models/category');

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
    if (err) {
        console.log(err);
    } else {
        app.locals.categories = categories;
    }
});



//Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongoUrl: 'mongodb+srv://pppadmin:testing123@cluster0.pzqdl.mongodb.net/bookdemo?retryWrites=true&w=majority' }),
    cooke: { maxAge: 180 * 60 * 1000 }
}));
app.use('/users/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
// Express fileUpload middleware
app.use(fileUpload());

var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage });

//Express Validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '.pdf':
                    return '.pdf';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//Express Messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.cart = req.session.cart;
    res.locals.email = req.session.email;
    res.locals.user = req.user || null;
    next();
});

app.get('/success', (req, res) => {
    res.render('success')

})



app.get('/failed', (req, res) => {

    res.redirect('/users/plan')
    req.flash('payment failed! please retry again')
})

// Set routes


app.get('/search', getproduct, getcart1, renderForm);

function getproduct(req, res, next) {
    // Code here
    const { productName } = req.query;
    Product.find({ $text: { $search: productName } }, function (err, products) {

        if (err)
            console.log(err);
        
        res.locals.savedproduct = products;
        next();
    });
};
function getcart1(req, res, next) {
    // Code here
    if (req.isAuthenticated()) {
        Cart.find({ owner: req.user._id }, function (err, cart) {
            if (err) {
                console.log(err);
            }

            res.locals.cart = cart;

            next();

        })
    }
    else {

        var cart = { cart: '0' }
        res.locals.cart = cart;
        next();
        console.log(cart);
        console.log('user is not logged in');
    }


};

function renderForm(req, res) {
    
    res.render("search");
};
//app.get('/search', async (req, res) => {
//    const { productName } = req.query;
//    Product.find({ $text: { $search: productName } }, function (err, products) {



//        res.render('search',
//            {
//                products: products
//            });
//    });

//    if (req.isAuthenticated()) {
//        Cart.find({ owner: req.user._id }, function (err, cart) {
//            if (err) {
//                console.log(err);
//            }

//            res.locals.cart = cart;
//            console.log(cart)
//        });

//        User.find(function (err, user) {

//            if (err)
//                console.log(err);
//            res.locals.saveduser = user;


//        });
//    }
//    else {

//        var cart = { cart: '0' }
//        res.locals.cart = cart;
//        console.log(cart);
//        console.log('user is not logged in');
//    }
//})
var pages = require('./routes/pages.js');
var cart = require('./routes/cart.js');
var users = require('./routes/users.js');
var Plan = require('./routes/plan.js');
var Pay = require('./routes/pay.js');
var products = require('./routes/products.js');
var adminpages = require('./routes/admin_pages.js');
var adminCategories = require('./routes/admin_categories.js');
var adminProducts = require('./routes/admin_products.js');
var adminupcome = require('./routes/upcome_products.js');


app.use('/', pages);
app.use('/admin/pages', adminpages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/admin/upcomeproducts', adminupcome);
app.use('/', cart);
app.use('/plan', Plan);
app.use('/pay', Pay);
app.use('/users', users);

// start the server listening for requests
app.listen(process.env.PORT || 2000,
	() => console.log("Server is running..."));