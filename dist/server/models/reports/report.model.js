"use strict";
exports.__esModule = true;
var mongoose = require("mongoose");
// Import Schemas
var report_schema_1 = require("./report.schema");
// Define & export Mongoose Model with Interface
exports.Report = mongoose.model('reports', report_schema_1.ReportSchema);
