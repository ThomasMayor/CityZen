"use strict";
exports.__esModule = true;
var mongoose = require("mongoose");
// Import MongoDB config
var config_1 = require("./config");
// Define MongoDB path url
var MONGODB_URI = process.env.MONGODB_URI || config_1.DB_HOST + "/" + config_1.DB_NAME;
var DataBase = (function () {
    function DataBase() {
    }
    DataBase.connect = function () {
        // connect to database
        return new Promise(function (resolve, reject) {
            // Connect to MongoDB with Mongoose
            console.log('Connecting to', MONGODB_URI);
            mongoose.connect(MONGODB_URI, {
                useMongoClient: true
            }, function (err) {
                if (err) {
                    reject("Error connecting to MongoDB!");
                }
                else {
                    resolve("MongoDB Ready!");
                }
            });
        });
    };
    return DataBase;
}());
exports.DataBase = DataBase;
