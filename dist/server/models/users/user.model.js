"use strict";
exports.__esModule = true;
var mongoose = require("mongoose");
// Import Schemas
var user_schema_1 = require("./user.schema");
// Define & export Mongoose Model with Interface
exports.User = mongoose.model('users', user_schema_1.UserSchema);
