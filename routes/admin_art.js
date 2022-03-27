var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Product model
var Art = require('../models/art');
// Get Category model
var Author = require('../models/author');

/*
 * GET products index
 */
router.get('/', isAdmin, function (req, res) {
    var count;

    Art.countDocuments(function (err, c) {
        count = c;
    });

    Art.find(function (err, art) {
        res.render('admin/art', {
            art: art,
            count: count
        });
    });
});
/*
 * GET add product
 */
router.get('/add-art', isAdmin, function (req, res) {

    var title = "";

    Author.find(function (err, author) {
        res.render('admin/add_art', {
            title: title,
            author: author,
       
        });
    });


});

/*
 * POST add product
 */

router.post('/add-art', function (req, res) {

    if (!req.files) { imageFile = ""; }
    if (req.files) {

        var imageFile = typeof (req.files.image) !== "undefined " ? req.files.image.name : "";
      
    }

   
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
   
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var author = req.body.author;

    var errors = req.validationErrors();

    if (errors) {
        Author.find(function (err, author) {
            res.render('admin/add_art', {
                errors: errors,
                title: title,
                author: author
              
            });
        });
    } else {
        Art.findOne({ slug: slug }, function (err, art) {
            if (art) {
                req.flash('danger', 'Title exists, choose another.');
                Author.find(function (err, author) {
                    res.render('admin/add_art', {
                        title: title,
                        author: author,

                    });
                });
            } else {

               

                var art = new Art({
                    title: title,
                    slug: slug, 
                    author: author,
                    image: imageFile,
        
                });

                art.save(function (err) {
                    if (err)
                        return console.log(err);

                    mkdirp('public/art_images/' + art._id, function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/art_images/' + art._id + '/gallery', function (err) {
                        return console.log(err);
                    });

                    mkdirp('public/art_images/' + art._id + '/gallery/thumbs', function (err) {
                        return console.log(err);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/art_images/' + art._id + '/' + imageFile;

                        productImage.mv(path, function (err) {
                            return console.log(err);
                        });
                    }
                   

                    req.flash('success', 'image added!');
                    res.redirect('/admin/art');
                });
            }
        });
    }

});

/*
 * GET edit product
 */
router.get('/edit-art/:id', isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;
    req.session.errors = null;

    Author.find(function (err, author) {

        Art.findById(req.params.id, function (err, p) {
            if (err) {
                console.log(err);
                res.redirect('admin/art');
            } else {
                var galleryDir = 'public/art_images/' + p._id;
                var galleryImages = null;

                fs.readdir(galleryDir, function (err, files) {
                    if (err) {
                        console.log(err);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit_product', {
                            title: p.title,
                            author: author,
                            author: p.author.replace(/\s+/g, '-').toLowerCase(),
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
router.post('/edit-art/:id', function (req, res) {

    if (!req.files) { imageFile = "" }
    if (req.files) {

        var imageFile = typeof (req.files.image) !== "undefined " ? req.files.image.name : "";
        
    }

    //var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    //var pdfFile = typeof req.files.pdf !== "undefined" ? req.files.pdf.name : "";

    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
   
    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var author = req.body.author;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/art/edit-art/' + id);
    } else {
        Art.findOne({ slug: slug, _id: { '$ne': id } }, function (err, p) {
            if (err)
                console.log(err);

            if (p) {
                req.flash('danger', 'Image title exists, choose another.');
                res.redirect('/admin/art/edit-art/' + id);
            } else {
                Art.findById(id, function (err, p) {
                    if (err)
                        console.log(err);

                    p.title = title;
                    p.slug = slug;
                    p.author = author;
                    p.category = category;
                    if (imageFile != "") {
                        p.image = imageFile;
                    }
                   
                    p.save(function (err) {
                        if (err)
                            console.log(err);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/art_images/' + id + '/' + pimage, function (err) {
                                    if (err)
                                        console.log(err);
                                });
                            }
                          
                              var productImage = req.files.image;
                              
                            var path = 'public/art_images/' + id + '/' + imageFile;
                           
                            productImage.mv(path, function (err) {
                                return console.log(err);
                            });
                           

                        }

                        req.flash('success', 'Image edited!');
                        res.redirect('/admin/art/edit-art/' + id);
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

    var originalImage = 'public/art_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/art_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (err) {
        if (err) {
            console.log(err);
        } else {
            fs.remove(thumbImage, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    req.flash('success', 'image deleted!');
                    res.redirect('/admin/art/edit-art/' + req.query.id);
                   
                    
                }
            });
        }
    });

});

/*
 * GET delete product
 */
router.get('/delete-art/:id', isAdmin, function (req, res) {

    var id = req.params.id;
    var path = 'public/art_images/' + id;

    fs.remove(path, function (err) {
        if (err) {
            console.log(err);
        } else {
            Art.findByIdAndRemove(id, function (err) {
                console.log(err);
            });

            req.flash('success', 'Image deleted!');
            res.redirect('/admin/art/');
        }
    });

});

// Exports
module.exports = router;