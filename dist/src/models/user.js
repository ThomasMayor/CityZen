"use strict";
exports.__esModule = true;
exports.userScore = {
    compute: function (user) {
        if (!user || user.reports == 0)
            return 0;
        var mult = Math.min(0.5, Math.max(10, (user.approvals - user.disapprovals) / user.reports));
        var scoreBase = user.reports * 10 + user.approvals * 20 - user.disapprovals * 5;
        return Math.round(scoreBase * mult);
    }
};
