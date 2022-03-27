var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');
var isAdmin = auth.isAdmin;

// Get Category model
var Author = require('../models/author');

/*
 * GET category index
 */
router.get('/', isAdmin, function (req, res) {
    Author.find(function (err, author) {
        if (err)
            return console.log(err);
        res.render('admin/author', {
            author: author
        });
    });
});

/*
 * GET add category
 */
router.get('/add-author', isAdmin, function (req, res) {

    var name = "";
    var contact = "";
    var socialname = "";
    var social = "";

    res.render('admin/add_author', {
        name: name,
        contact: contact,
        socialname: socialname,
        social: social
    });

});

/*
 * POST add category
 */
router.post('/add-author', function (req, res) {
    if (!req.files) { imageFile = ""; }
    if (req.files) {

        var imageFile = typeof (req.files.image) !== "undefined " ? req.files.image.name : "";

    }
    req.checkBody('name', 'name must have a value.').notEmpty();

    var name = req.body.name;
    var contact = req.body.contact;
    var socialname = req.body.socialname;
    var social = req.body.social;
    var slug = name.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_author', {
            errors: errors,
            name: name,
            socialname: socialname,
            social: social,
            contact: contact
        });
    } else {
        Author.findOne({ slug: slug }, function (err, author) {
            if (author) {
                req.flash('danger', 'author name exists, choose another.');
                res.render('admin/add_author', {
                    name: name,
                    contact: contact,
                    socialname: socialname,
                    social: social
                });
            } else {
                var author = new Author({
                    name: name,
                    contact: contact,
                    socialname: socialname,
                    social: social,
                    slug: slug,
                    image: imageFile
                });

                author.save(function (err) {
                    if (err)
                        return console.log(err);

                    Author.find(function (err, author) {
                        if (err) {
                            console.log(err);
                        } else {

                            req.app.locals.author = author;
                        }
                    });

                    req.flash('success', 'Artist name added!');
                    res.redirect('/admin/author');
                });
            }
        });
    }

});




 //* GET edit category
 
router.get('/edit-author/:id', isAdmin, function (req, res) {

    Author.findById(req.params.id, function (err, author) {
        if (err)
            return console.log(err);

        res.render('admin/edit_author', {
            name: author.name,
            contact: author.contact,
            socialname: author.socialname,
            social: author.social,
            id: author._id
        });
    });

});

/*
 * POST edit category
 */
router.post('/edit-author/:id', function (req, res) {

    req.checkBody('name', 'Artist name must have a value.').notEmpty();

    var name = req.body.name;
    var contact = req.body.contact;
    var socialname = req.body.socialname;
    var social = req.body.social;
    var slug = name.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_author', {
            errors: errors,
            name: name,
            contact: contact,
            socialname: socialname,
            social: social,
            id: id
        });
    } else {
        Author.findOne({ slug: slug, _id: { '$ne': id } }, function (err, author) {
            if (author) {
                req.flash('danger', 'Artist Name exists, choose another.');
                res.render('admin/edit_author', {
                    name: name,
                    contact: contact,
                    socialname: socialname,
                    social: social,
                    id: id
                });
            } else {
                Author.findById(id, function (err, author) {
                    if (err)
                        return console.log(err);

                    author.name = name;
                    author.contact = contact;
                    author.social = social;
                    author.socialname= socialname,
                    author.slug = slug;

                    author.save(function (err) {
                        if (err)
                            return console.log(err);

                        Author.find(function (err, author) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.author = author;
                            }
                        });

                        req.flash('success', 'Artist name edited!');
                        res.redirect('/admin/author/edit-author/' + id);
                    });

                });


            }
        });
    }

});





 //* GET delete author
 
router.get('/delete-author/:id', isAdmin,function (req, res) {
    Author.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Author.find(function (err, author) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.author = author;
            }
        });

        req.flash('success', 'Artist name deleted!');
        res.redirect('/admin/author/');
    });
});


// Exports
module.exports = router;