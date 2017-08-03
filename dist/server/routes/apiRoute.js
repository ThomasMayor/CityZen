"use strict";
exports.__esModule = true;
var express = require("express");
var users_routes_1 = require("./api/users/users.routes");
var reports_routes_1 = require("./api/reports/reports.routes");
var app = express();
var APIRoutes = (function () {
    function APIRoutes() {
    }
    APIRoutes.prototype.routes = function () {
        app.use("/api/users", new users_routes_1.UsersRoutes().routes());
        app.use("/api/reports", new reports_routes_1.ReportsRoutes().routes());
        return app;
    };
    return APIRoutes;
}());
exports.APIRoutes = APIRoutes;
