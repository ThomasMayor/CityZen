"use strict";
exports.__esModule = true;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var helper_controller_1 = require("../helper.controller");
var user_model_1 = require("./user.model");
// Import config
var config_1 = require("../../config");
exports.userController = {
    // Route to add mokup user in MongoDB
    /*
      User connection info:
        email:  aa@aa.ch
        pwd:    A123456
    */
    setup: function (req, res) {
        // Use bcrypte to encrypte user password
        bcrypt.hash('A123456', config_1.BCRYPT_ROUND, function (err, hash) {
            if (err) {
                res.json({ success: false, message: 'Error with bcrypt hash password' });
                return;
            }
            // Store hash in your password DB.
            // create a sample user
            //(new User(<IUserModel>req.body))
            var newuser = new user_model_1.User({
                email: 'aa@aa.ch',
                name: 'Thomas Mayor',
                password: hash,
                admin: true,
                created: new Date(),
                profilePicture: ''
            });
            newuser.save(function (err, doc) {
                if (err) {
                    res.json({ success: false, message: 'Error with save user mokup' });
                    return;
                }
                ;
                console.log('User saved successfully');
                res.json({ success: true, user: newuser.toJSON() });
            });
        });
    },
    signup: function (req, res) {
        //(new User(<IUserModel>req.body))
        // check existe user in DB
        // before add new user
        // find the user
        exports.userController
            .checkNameEmailExists(req.body.email, req.body.name)
            .then(function (result) {
            if (result.emailExists || result.nameExists) {
                var msg = '';
                if (result.emailExists && result.nameExists) {
                    msg = "L'email et le nom sont déjà utilisés.";
                }
                else if (result.nameExists) {
                    msg = "Le nom est déjà utilisé.";
                }
                else {
                    msg = "L'email est déjà utilisé.";
                }
                return res.send({ success: false, message: msg });
            }
            // No existing user found, create the new user
            // Check password length is >= 6
            if (req.body.password.length < config_1.PASSWORD_MIN_LENGHT) {
                res.json({ success: false, message: "Error password require min " + config_1.PASSWORD_MIN_LENGHT + " characters" });
                return;
            }
            // Use bcrypte to encrypte user password
            bcrypt.hash(req.body.password, config_1.BCRYPT_ROUND, function (err, hash) {
                if (err) {
                    console.log('Error with bcrypt hash password', err);
                    res.json({ success: false, message: 'Error with bcrypt hash password' });
                    return;
                }
                // create user
                var newuser = new user_model_1.User({
                    email: req.body.email,
                    password: hash,
                    name: req.body.name,
                    admin: false,
                    created: new Date(),
                    profilePicture: ''
                });
                newuser.save(function (err, doc) {
                    if (err)
                        return console.log(err);
                    console.log('User created successfully');
                    var token = jwt.sign(newuser.toJSON(), config_1.SECRET_TOKEN_KEY, {
                        expiresIn: config_1.JWT_EXPIRE // expires in 24 hours
                    });
                    res.json({ success: true, message: 'User created successfully', token: token });
                });
            });
        });
    },
    isAuth: function (req, res) {
        var token = jwt.sign(req.authUser.toJSON(), config_1.SECRET_TOKEN_KEY, {
            expiresIn: config_1.JWT_EXPIRE // expires in 24 hours
        });
        res.json({ success: true, message: 'JWT is correct', token: token });
    },
    auth: function (req, res) {
        // find the user
        user_model_1.User.findOne({ email: req.body.email }, function (err, user) {
            if (err)
                throw err;
            if (!user) {
                res.json({ success: false, message: 'Authentication failed. User not found.' });
            }
            else if (user) {
                // check if password matches
                // Load hash from your password DB.
                // Use bcrypte to compare user password with hash
                bcrypt.compare(req.body.password, user.password, function (err, result) {
                    // res == true
                    if (err) {
                        console.log('Authentication failed. Error with password comparaison.', err);
                        res.json({ success: false, message: 'Authentication failed. Error with password.' });
                        return;
                    }
                    if (result === false) {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    }
                    else if (result === true) {
                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(user.toJSON(), config_1.SECRET_TOKEN_KEY, {
                            expiresIn: config_1.JWT_EXPIRE // expires in 24 hours
                        });
                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    }
                    else {
                        res.json({ success: false, message: 'Authentication failed. Error with compare password: res-> ' + result });
                        return;
                    }
                });
            }
        });
    },
    getAll: function (req, res) {
        user_model_1.User.find(function (err, docs) {
            if (err)
                return console.log(err);
            var docsReady = docs.map(function (user) { return user.toJSON(); });
            res.json(docsReady);
        });
    },
    getUser: function (req, res) {
        res.json(req.user.toJSON());
    },
    checkNameEmailExists: function (email, name, id) {
        return new Promise(function (resolve, reject) {
            user_model_1.User.find({ $or: [{ email: email }, { name: name }] })
                .then(function (docs) {
                var result = { nameExists: false, emailExists: false };
                if (docs.length) {
                    docs.forEach(function (user) {
                        if (id && user._id.toString() == id.toString())
                            return;
                        if (user.email == email)
                            result.emailExists = true;
                        if (user.name == name)
                            result.nameExists = true;
                    });
                }
                resolve(result);
            })["catch"](reject);
        });
    },
    patchUser: function (req, res) {
        var user = req.user;
        if (!req.authUser.admin && req.authUser._id != user._id) {
            return res.status(403).send({ success: false, message: "Vous n'avez pas le droit de modifier cet utilisateur." });
        }
        if (req.body) {
            var email = req.body.email ? req.body.email : 'NotAnEmail';
            var name_1 = req.body.name ? req.body.name : '';
            // HACK : this.checkNameEmailExists is undefined
            exports.userController.checkNameEmailExists(email, name_1, user._id)
                .then(function (result) {
                if (result.emailExists || result.nameExists) {
                    var msg = '';
                    if (result.emailExists && result.nameExists) {
                        msg = "L'email et le nom sont déjà utilisés.";
                    }
                    else if (result.nameExists) {
                        msg = "Le nom est déjà utilisé.";
                    }
                    else {
                        msg = "L'email est déjà utilisé.";
                    }
                    return res.send({ success: false, message: msg });
                }
                if (req.body.email)
                    user.email = req.body.email;
                if (req.body.name)
                    user.name = req.body.name;
                if (req.body.profilePicture)
                    user.profilePicture = req.body.profilePicture;
                var callback = function (err, hash) {
                    if (err) {
                        console.log('Error with bcrypt hash password', err);
                        helper_controller_1.helperController.handleError(req, res, 'Error with bcrypt hash password');
                        return;
                    }
                    if (hash) {
                        user.password = hash;
                    }
                    user.save(function (err, doc) {
                        if (err)
                            helper_controller_1.helperController.handleError(req, res, err);
                        else {
                            var result_1 = { success: true, message: 'User created successfully' };
                            //if for current logged in user, generate new token
                            if (user._id == req.authUser._id) {
                                var token = jwt.sign(user.toJSON(), config_1.SECRET_TOKEN_KEY, {
                                    expiresIn: config_1.JWT_EXPIRE // expires in 24 hours
                                });
                                result_1.token = token;
                            }
                            else {
                                result_1.user = user.toJSON();
                            }
                            res.json(result_1);
                        }
                    });
                };
                if (req.body.password) {
                    bcrypt.hash(req.body.password, config_1.BCRYPT_ROUND, callback);
                }
                else {
                    callback('', '');
                }
            });
        }
        else
            helper_controller_1.helperController.handleError(req, res, 'Requête invalide', 400);
    },
    checkJWT: function (req, jwtuser, next) {
        user_model_1.User.findById(helper_controller_1.helperController.toObjectId(jwtuser._id)).then(function (user) {
            if (!user) {
                next(null, false);
            }
            else {
                req.authUser = user;
                next(null, user);
            }
        })["catch"](next);
    },
    checkUID: function (req, res, next, uid) {
        user_model_1.User.findById(helper_controller_1.helperController.toObjectId(uid)).then(function (user) {
            if (!user) {
                return res.status(404 /* Not Found */).send();
            }
            else {
                //add user to request
                req.user = user;
                return next();
            }
        })["catch"](next);
    }
};
