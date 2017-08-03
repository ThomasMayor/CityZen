"use strict";
exports.__esModule = true;
var express = require("express");
var users_controller_1 = require("../../../models/users/users.controller");
var log_1 = require("../../../log");
var passport = require("passport");
var router = express.Router();
var UsersRoutes = (function () {
    function UsersRoutes() {
    }
    UsersRoutes.prototype.routes = function () {
        // Public Endpoints:
        router.get('/setup', log_1.log, users_controller_1.userController.setup);
        router.post('/auth', log_1.log, users_controller_1.userController.auth);
        router.post('/signup', log_1.log, users_controller_1.userController.signup);
        // Privates Endpoints
        router.param('uid', users_controller_1.userController.checkUID);
        router.get('/isauth', passport.authenticate('jwt', { session: false }), log_1.log, users_controller_1.userController.isAuth);
        router.get('/', passport.authenticate('jwt', { session: false }), log_1.log, users_controller_1.userController.getAll);
        router.get('/:uid', passport.authenticate('jwt', { session: false }), log_1.log, users_controller_1.userController.getUser);
        router.patch('/:uid', passport.authenticate('jwt', { session: false }), log_1.log, users_controller_1.userController.patchUser);
        // then return the user router
        return router;
    };
    return UsersRoutes;
}());
exports.UsersRoutes = UsersRoutes;
