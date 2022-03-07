var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Product = require('../models/product');
// Get Category model
var Category = require('../models/category');

/*
 * GET products index
 */
router.get('/', isAdmin, function (req, res) {
    var count;

    Product.countDocuments(function (err, c) {
        count = c;
    });

    Product.find(function (err, products) {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});
/*
 * GET add product
 */
router.get('/add-product', isAdmin, function (req, res) {

    var title = "";
    var desc = "";
    var price = "";
    var priority = "";
    var rating = "";
    var author = "";
    var totalpage = "";
    var status = "";

    Category.find(function (err, categories) {
        res.render('admin/add_product', {
            title: title,
            desc: desc,
            author: author,
            totalpage: totalpage,
            status: status,
            categories: categories,
            price: price,
            priority: priority,
            rating: rating
        });
    });


});

/*
 * POST add product
 */

router.post('/add-product', function (req, res) {

    if (!req.files) { imageFile = ""; pdfFile = ""; }
    if (req.files) {

        var imageFile = typeof (req.files.image) !== "undefined " ? req.files.image.name : "";
        var pdfFile = typeof (req.files.pdf) !== "undefined " ? req.files.pdf.name : "";
    }

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('author', 'author must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    req.checkBody('pdf', 'You must upload a pdf file').isImage(pdfFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var totalpage = req.body.totalpage;
    var author = req.body.author;
    var status = req.body.status;
    var price = req.body.price;
    var category = req.body.category;
    var priority = req.body.priority;
    var rating = req.body.rating;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (err, categories) {
            res.render('admin/add_product', {
                errors: errors,
                title: title,
                desc: desc,
                author: author,
                totalpage: totalpage,
                status: status,
                categories: categories,
                price: price,
                priority: priority,
                rating: rating
            });
        });
    } else {
        Product.findOne({ slug: slug }, function (err, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                Category.find(function (err, categories) {
                    res.render('admin/add_product', {
                        title: title,
                        desc: desc,
                        author: author,
                        totalpage: totalpage,
                        status: status,
                        categories: categories,
                        price: price,
                        priority: priority,
                        rating: rating
                    });
                });
            } else {

                var price2 = parseFloat(price).toFixed(2);

                var product = new Product({
                    title: title,
                    slug: slug,
                    desc: desc,
                    author: author,
                    totalpage: totalpage,
                    status: status,
                    price: price2,
                    category: category,
                    priority: priority,
                    rating: rating,
                    image: imageFile,
                    pdf: pdfFile
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
                    if (pdfFile != "") {
                        var productpdf = req.files.pdf;
                        var path1 = 'public/product_images/' + product._id + '/' + pdfFile;

                        productpdf.mv(path1, function (err) {
                            return console.log(err);
                        });
                    }

                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

/*
 * GET edit product
 */
router.get('/edit-product/:id', isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Category.find(function (err, categories) {

        Product.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('admin/products');
            } else {
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            errors: errors,
                            desc: p.desc,
                            author: p.author,
                            totalpage: p.totalpage,
                            status: p.status,
                            categories: categories,
                            priority: p.priority,
                            rating: p.rating,
                            category: p.category.replace(/\s+/g, '-').toLowerCase(),
                            price: parseFloat(p.price).toFixed(2),
                            image: p.image,
                            pdf: p.pdf,
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
router.post('/edit-product/:id', function (req, res) {

    if (!req.files) { imageFile = ""; pdfFile = ""; }
    if (req.files) {

        var imageFile = typeof (req.files.image) !== "undefined " ? req.files.image.name : "";
        var pdfFile = typeof (req.files.pdf) !== "undefined " ? req.files.pdf.name : "";
    }

    //var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    //var pdfFile = typeof req.files.pdf !== "undefined" ? req.files.pdf.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('desc', 'Description must have a value.').notEmpty();
    req.checkBody('author', 'Author must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    req.checkBody('pdf', 'You must upload a pdf file').isImage(pdfFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var desc = req.body.desc;
    var author = req.body.author;
    var totalpage = req.body.totalpage;
    var status = req.body.status;
    var price = req.body.price;
    var category = req.body.category;
    var priority = req.body.priority;
    var rating = req.body.rating;
    var pimage = req.body.pimage;
    var ppdf = req.body.ppdf;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.author = author;
                    p.totalpage = totalpage;
                    p.status = status;
                    p.priority = priority;
                    p.rating = rating;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                    if (pdfFile != "") {
                        p.pdf = pdfFile;
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
                            if (pdfFile != "") {
                                if (ppdf != "") {
                                    fs.remove('public/product_images/' + id + '/' + ppdf, function (err) {
                                        if (err)
                                            console.log(err);
                                    });
                                }
                            }
                              var productImage = req.files.image;
                              var productpdf = req.files.pdf;
                            var path = 'public/product_images/' + id + '/' + imageFile;
                            var path1 = 'public/product_images/' + id + '/' + pdfFile;
                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });
                            productpdf.mv(path1, function (err) {
                                  return console.log(err);
                              });

                        }

                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });

                });
            }
        });
    }

});
/*
 * GET delete image
 */
router.get('/delete-image/:image', isAdmin,function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var originalpdf = 'public/product_images/' + req.query.id + '/gallery/' + req.params.pdf;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    fs.remove(originalpdf, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.flash('success', 'pdf deleted!');
                            res.redirect('/admin/products/edit-product/' + req.query.id);
                        }
                    });
                    
                }
            });
        }
    });

});

/*
 * GET delete product
 */
router.get('/delete-product/:id', isAdmin, function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Product.findByIdAndRemove(id, function (err) {
                console.log(err);
            });

            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products/');
        }
    });

});

// Exports
module.exports = router;