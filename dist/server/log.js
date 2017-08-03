"use strict";
exports.__esModule = true;
exports.log = function (req, res, next) {
    if (process.env.NODE_ENV != 'test') {
        console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log("Query: route path -> ", req.route.path);
        console.log("       route params -> ", req.params);
        console.log("       route method -> ", req.route.methods);
    }
    next();
};
