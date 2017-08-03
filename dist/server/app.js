"use strict";
/// <reference path="./@types/index.d.ts" />
exports.__esModule = true;
var express = require("express");
var http = require("http");
var bodyParser = require("body-parser");
var cors = require("cors");
var morgan = require("morgan");
var serverRoute_1 = require("./routes/serverRoute");
var apiRoute_1 = require("./routes/apiRoute");
var database_1 = require("./database");
// Import secretTokenKey config
var config_1 = require("./config");
var users_controller_1 = require("./models/users/users.controller");
var passport = require("passport");
var passport_jwt_1 = require("passport-jwt");
var Server = (function () {
    function Server() {
        this.app = express();
    }
    Server.prototype.initServer = function () {
        this.server = http.createServer(this.app);
    };
    Server.prototype.init = function () {
        this.config();
        this.middleware();
        return this.dbConnect();
    };
    Server.prototype.config = function () {
        this.port = this.normalizePort(process.env.PORT || 8080);
    };
    Server.prototype.middleware = function () {
        //Authorization middleware
        var options = {
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
            secretOrKey: config_1.SECRET_TOKEN_KEY,
            passReqToCallback: true
        };
        this.app.use(passport.initialize());
        passport.use(new passport_jwt_1.Strategy(options, users_controller_1.userController.checkJWT));
        //Other middleware
        this.app
            .use(bodyParser.json({ limit: '50mb' }))
            .use(bodyParser.json({ type: 'application/vnd.api+json' }))
            .use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
            .set('superSecret', config_1.SECRET_TOKEN_KEY)
            .use(cors());
        // use morgan to log requests to the console
        if (process.env.NODE_ENV != "test")
            this.app.use(morgan('dev'));
    };
    Server.prototype.dbConnect = function () {
        var _this = this;
        // Load DB connection
        return database_1.DataBase.connect()
            .then(function (result) {
            // Load all route
            console.log(result);
            // Server Endpoints
            _this.app.use(new serverRoute_1.ServerRoutes().routes());
            // REST API Endpoints
            _this.app.use(new apiRoute_1.APIRoutes().routes());
        })["catch"](function (error) {
            // DB connection Error => load only server route
            console.log(error);
            // Server Endpoints
            _this.app.use(new serverRoute_1.ServerRoutes().routes());
            return error;
        })
            .then(function (error) {
            // Then catch 404 & db error connection
            _this.app.use(function (req, res) {
                console.log(error);
                var message = (error) ? [{ error: 'Page not found' }, { error: error }] : [{ error: 'Page not found' }];
                res.status(404).json(message);
            });
        });
    };
    Server.prototype.onError = function (error) {
        if (error.syscall !== 'listen')
            throw error;
        var bind = (typeof this.port === 'string') ? 'Pipe ' + this.port : 'Port ' + this.port;
        switch (error.code) {
            case 'EACCES':
                console.error(bind + " requires elevated privileges");
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(bind + " is already in use");
                process.exit(1);
                break;
            default:
                throw error;
        }
    };
    Server.prototype.normalizePort = function (val) {
        var port = (typeof val === 'string') ? parseInt(val, 10) : val;
        if (isNaN(port))
            return val;
        else if (port >= 0)
            return port;
        else
            return false;
    };
    Server.prototype.bootstrap = function () {
        var _this = this;
        console.log('bootstrap');
        this.server.on('error', this.onError);
        this.server.listen(this.port, function () {
            console.log("Listnening on port " + _this.port);
        });
    };
    return Server;
}());
exports.Server = Server;
