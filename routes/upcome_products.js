var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Product1 = require('../models/upcome_product');
// Get Category model
var Category = require('../models/category');

/*
 * GET products index
 */
router.get('/', isAdmin, function (req, res) {
    var count;

    Product1.countDocuments(function (err, c) {
        count = c;
    });

    Product1.find(function (err, products) {
        res.render('admin/upcome_products', {
            products: products,
            count: count
        });
    });
});
/*
 * GET add product
 */
router.get('/add-upcomeproduct', isAdmin, function (req, res) {

    var title = "";
    var desc = "";
    var price = "";
    var author = "";
    var totalpage = "";
    var publishdate = "";

    Category.find(function (err, categories) {
        res.render('admin/addupcome_product', {
            title: title,
            desc: desc,
            categories: categories,
            author: author,
            totalpage: totalpage,
            publishdate: publishdate,
            price: price,
            
        });
    });


});

/*
 * POST add product
 */

router.post('/add-upcomeproduct', function (req, res) {

    if (!req.files) { imageFile = ""; }
    if (req.files) {

        var imageFile = typeof (req.files.image) !== "undefined " ? req.files.image.name : "";
    }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('author', 'Author must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var author = req.body.author;
    var totalpage = req.body.totalpage;
    var publishdate = req.body.publishdate;
    var price = req.body.price;
    var category = req.body.category;
  

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/addupcome_product', {
                errors: errors,
                title: title,
                desc: desc,
                author: author,
                totalpage: totalpage,
                publishdate: publishdate,
                categories: categories,
                price: price,
  
            });
        });
    } else {
        Product1.findOne({ slug: slug }, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/addupcome_product', {
                        title: title,
                        desc: desc,
                        author: author,
                        totalpage: totalpage,
                        publishdate: publishdate,
                        categories: categories,
                        price: price,
     
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product1({
                    title: title,
                    slug: slug,
                    desc: desc,
                    author: author,
                    totalpage: totalpage,
                    publishdate: publishdate,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                product.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/product_images/' + product._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/product_images/' + product._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + product._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/upcomeproducts');
                });
            }
        });
    }

});

/*
 * GET edit product
 */
router.get('/edit-upcomeproduct/:id', isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product1.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('admin/upcomeproducts');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/editupcome_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            author: p.author,
                            totalpage: p.totalpage,
                            publishdate: p.publishdate,
                            categories: categories,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            galleryImages: galleryImages,
                            id: p._id
                        });
                    }
                });
            }
        });

    });

});

/*
 * POST edit product
 */
router.post('/edit-upcomeproduct/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('author', 'Author must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var author = req.body.author;
    var totalpage = req.body.totalpage;
    var publishdate = req.body.publishdate;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/upcomeproducts/edit-upcomeproduct/' + id);
    } else {
        Product1.findOne({ slug: slug, _id: { '$ne': id } }, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/upcomeproducts/edit-upcomeproduct/' + id);
            } else {
                Product1.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.author = author;
                    p.totalpage = totalpage;
                    p.publishdate = publishdate;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }

                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/upcomeproducts/edit-upcomeproduct/' + id);
                    });

                });
            }
        });
    }

});
/*
 * GET delete image
 */
router.get('/delete-image/:image', isAdmin, function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'Image deleted!');
                    res.redirect('/admin/upcomeproducts/edit-upcomeproduct/' + req.query.id);
                }
            });
        }
    });
});

/*
 * GET delete product
 */
router.get('/delete-upcomeproduct/:id', isAdmin, function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product1.findByIdAndRemove(id, function (err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted!');
            res.redirect('/admin/upcomeproducts/');
        }
    });

});

// Exports
module.exports = router;