"use strict";
exports.__esModule = true;
var mongoose = require("mongoose");
exports.helperController = {
    handleError: function (req, res, err, status) {
        if (status === void 0) { status = 200; }
        res.status(status).json({ success: false, message: err });
    },
    toObjectId: function (_id) {
        return mongoose.Types.ObjectId.createFromHexString(_id);
    }
};
