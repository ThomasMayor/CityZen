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
    /*setup : (req:any,res:any) => {
    // Use bcrypte to encrypte user password
    bcrypt.hash('A123456', BCRYPT_ROUND, (err, hash) =>{
      if(err){
        res.json({ success: false, message: 'Error with bcrypt hash password' });
        return
      }
      // Store hash in your password DB.
      // create a sample user
      //(new User(<IUserModel>req.body))
      var newuser = <IUserModel>new User({
        email: 'aa@aa.ch',
        name: 'Thomas Mayor',
        password: hash,
        admin: true,
        created: new Date(),
        profilePicture: '',
      });
      newuser.save((err, doc:IUserModel) => {
            if(err) {
          res.json({ success: false, message: 'Error with save user mokup' });
          return;
        };
        console.log('User saved successfully');
        res.json({ success: true, user: newuser.toJSON() });
        })
    });
    },*/
    signToken: function (user) {
        var userToken = user.toJSON();
        userToken.profilePicture = '';
        userToken.email = '';
        var token = jwt.sign(userToken.toJSON(), config_1.SECRET_TOKEN_KEY, {
            expiresIn: config_1.JWT_EXPIRE // expires in 24 hours
        });
        return token;
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
                return helper_controller_1.helperController.handleError(req, res, msg);
            }
            // No existing user found, create the new user
            // Check password length is >= 6
            if (req.body.password.length < config_1.PASSWORD_MIN_LENGHT) {
                return helper_controller_1.helperController.handleError(req, res, "Le mot de passe doit \u00EAtre compos\u00E9 de " + config_1.PASSWORD_MIN_LENGHT + " caract\u00E8res au minimum.");
            }
            // Use bcrypte to encrypte user password
            bcrypt.hash(req.body.password, config_1.BCRYPT_ROUND, function (err, hash) {
                if (err) {
                    console.log('Error with bcrypt hash password', err);
                    return helper_controller_1.helperController.handleError(req, res, "Erreur d'encryption.");
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
                    if (err) {
                        return helper_controller_1.helperController.handleError(req, res, err);
                    }
                    console.log('User created successfully');
                    var token = exports.userController.signToken(newuser);
                    res.json({ success: true, message: 'Bienvenue', token: token, user: newuser.toJSON() });
                });
            });
        });
    },
    isAuth: function (req, res) {
        var token = exports.userController.signToken(req.authUser);
        res.json({ success: true, message: 'Succès', token: token, user: req.authUser.toJSON() });
    },
    auth: function (req, res) {
        // find the user
        user_model_1.User.findOne({ email: req.body.email }, function (err, user) {
            if (err)
                return helper_controller_1.helperController.handleError(req, res, "Erreur interne", 500);
            if (!user) {
                return helper_controller_1.helperController.handleError(req, res, "Echec de l'authentification.");
            }
            // check if password matches
            // Load hash from your password DB.
            // Use bcrypte to compare user password with hash
            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (err || result === false) {
                    return helper_controller_1.helperController.handleError(req, res, "Echec de l'authentification.");
                }
                // if user is found and password is right
                // create a token
                var token = exports.userController.signToken(user);
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token,
                    user: user.toJSON()
                });
            });
        });
    },
    getAllByScore: function (req, res) {
        user_model_1.User.find()
            .sort({ score: 1 })
            .exec(function (err, docs) {
            if (err)
                return helper_controller_1.helperController.handleError(req, res, "Impossible de charger les utilisateurs.");
            var docsReady = docs.map(function (user) { return user.toJSON(); });
            res.json({ success: true, users: docsReady });
        });
    },
    getUser: function (req, res) {
        res.json({ success: false, user: req.user.toJSON() });
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
            return helper_controller_1.helperController.handleError(req, res, "Vous n'avez pas le droit de modifier cet utilisateur.", 403);
        }
        if (req.body) {
            var email = req.body.email ? req.body.email : 'NotAnEmail';
            var name_1 = req.body.name ? req.body.name : '';
            // NOTE : this.checkNameEmailExists is undefined
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
                        helper_controller_1.helperController.handleError(req, res, 'Erreur interne', 500);
                        return;
                    }
                    if (hash)
                        user.password = hash;
                    user.save(function (err, newuser) {
                        if (err)
                            return helper_controller_1.helperController.handleError(req, res, 'Erreur interne');
                        var result = { success: true, message: 'Modification effectuée' };
                        //if for current logged in user, generate new token
                        if (user._id == req.authUser._id) {
                            var token = exports.userController.signToken(newuser);
                            result.token = token;
                        }
                        result.user = newuser.toJSON();
                        res.json(result);
                    });
                };
                //does user want to change password ?
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
