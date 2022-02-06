const bcrypt = require('bcryptjs');
const { SchemaTypeOptions } = require('mongoose');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth: {
        api_key:'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'
    }
}));

exports.getLogin = (req, res, next) => {
    let message = req.flash('Error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login page',
        errorMessage: message
    });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('Error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({email: email})
        .then(user => {
            if (!user) {
                req.flash('Error', 'Invalid email or password!');
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('Error', 'Invalid email or password!');
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
            })
        .catch(err => console.log(err)
    );
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({email: email}).then(userDoc => {
        if (userDoc) {
            req.flash('Error', 'Email already exists');
            return res.redirect('/signup');
        }
        return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
            const user = new User({
                email: email,
                password: hashedPassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                to: email,
                from: 'cse341@shop.com',
                subject: 'Welcome to our store!',
                html: '<h1>Welcome to the greatest shop of all time. You have successfully created your account</h1>'
            });
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err => {
        console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
};