"use strict";
exports.__esModule = true;
var express = require("express");
var reports_controller_1 = require("../../../models/reports/reports.controller");
var users_controller_1 = require("../../../models/users/users.controller");
var log_1 = require("../../../log");
var passport = require("passport");
var router = express.Router();
var ReportsRoutes = (function () {
    function ReportsRoutes() {
    }
    ReportsRoutes.prototype.routes = function () {
        // Private Endpoints:
        router.post('/', passport.authenticate('jwt', { session: false }), log_1.log, reports_controller_1.reportController.insert);
        router.get('/', passport.authenticate('jwt', { session: false }), log_1.log, reports_controller_1.reportController.getAll);
        router.param('uid', users_controller_1.userController.checkUID);
        router.get('/byuser/:uid', passport.authenticate('jwt', { session: false }), log_1.log, reports_controller_1.reportController.getAllByUserId);
        router.param('rid', reports_controller_1.reportController.checkRID);
        router.post('/:rid/approve', passport.authenticate('jwt', { session: false }), log_1.log, reports_controller_1.reportController.approve);
        router.post('/:rid/disapprove', passport.authenticate('jwt', { session: false }), log_1.log, reports_controller_1.reportController.disapprove);
        /*router.post('/signup', log, reportController.signup)

        // Privates Endpoints
        router.param('uid', reportController.checkUID);

        router.get('/isauth', passport.authenticate('jwt', {session: false}), log, reportController.isAuth)
        router.get('/users', passport.authenticate('jwt', {session: false}), log, reportController.getAll)
        router.get('/users/:id', passport.authenticate('jwt', {session: false}), log, reportController.getUser)
*/
        // then return the user router
        return router;
    };
    return ReportsRoutes;
}());
exports.ReportsRoutes = ReportsRoutes;
