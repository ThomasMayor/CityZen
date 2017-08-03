"use strict";
exports.__esModule = true;
var development_1 = require("../environments/development");
var production_1 = require("../environments/production");
function environmentConfig() {
    var env = development_1.devVariables;
    if (process.env.NODE_ENV === 'prod') {
        env = production_1.prodVariables;
    }
    return env;
}
exports.environmentConfig = environmentConfig;
exports.SECRET_TOKEN_KEY = 'secret token key';
exports.DB_HOST = environmentConfig().dbHost;
exports.DB_NAME = environmentConfig().dbName;
exports.BCRYPT_ROUND = 10;
exports.PASSWORD_MIN_LENGHT = 6;
exports.JWT_EXPIRE = 8640000; //10 days
