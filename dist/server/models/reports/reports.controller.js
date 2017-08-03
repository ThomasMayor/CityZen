"use strict";
exports.__esModule = true;
var report_model_1 = require("./report.model");
var helper_controller_1 = require("../helper.controller");
//import { DateFilter } from '../../../../cityzen-front/src/models/filter';
exports.reportController = {
    insert: function (req, res) {
        //check user has right to add report
        //compute score
        //check lastreport date
        var score = 0;
        if (req.authUser.reports > 0) {
            var mult = Math.min(0.5, Math.max(10, (req.authUser.approvals - req.authUser.disapprovals) / req.authUser.reports));
            var scoreBase = req.authUser.reports * 10 + req.authUser.approvals * 20 - req.authUser.disapprovals * 5;
            score = Math.round(scoreBase * mult);
        }
        var minDate = req.authUser.lastReport;
        var now = new Date();
        if (score > 1000) {
            minDate.setMinutes(minDate.getMinutes() + 5);
        }
        else if (score > 500) {
            minDate.setMinutes(minDate.getMinutes() + 30);
        }
        else if (score > 100) {
            minDate.setHours(minDate.getHours() + 1);
        }
        else if (score >= 0) {
            minDate.setHours(minDate.getHours() + 2);
        }
        else if (score > -100) {
            minDate.setHours(minDate.getHours() + 12);
        }
        else if (score > -250) {
            minDate.setDate(minDate.getDate() + 1);
        }
        else if (score > -500) {
            minDate.setDate(minDate.getDate() + 2);
        }
        else if (score > -1000) {
            minDate.setDate(minDate.getDate() + 7);
        }
        else if (score <= -1000) {
            minDate.setMonth(minDate.getMonth() + 1);
        }
        console.log('insert report', minDate, score);
        if (now.valueOf() < minDate.valueOf()) {
            var month = '';
            switch (minDate.getMonth()) {
                case 0:
                    month = 'janvier';
                    break;
                case 1:
                    month = 'fvrier';
                    break;
                case 2:
                    month = 'mars';
                    break;
                case 3:
                    month = 'avril';
                    break;
                case 4:
                    month = 'mai';
                    break;
                case 5:
                    month = 'juin';
                    break;
                case 6:
                    month = 'juillet';
                    break;
                case 7:
                    month = 'août';
                    break;
                case 8:
                    month = 'septembre';
                    break;
                case 9:
                    month = 'octobre';
                    break;
                case 10:
                    month = 'novembre';
                    break;
                case 11:
                    month = 'décembre';
                    break;
            }
            return res.json({ success: false, needwait: true, message: "Avant de pouvoir cr\u00E9er un nouveau constat, il vous reste \u00E0 patienter jusqu'au " + (minDate.getDate() + (minDate.getDate() == 1 ? 'er' : '')) + " " + month + " " + minDate.getFullYear() + " \u00E0 " + (minDate.getHours() < 10 ? '0' + minDate.getHours() : minDate.getHours()) + "h" + (minDate.getMinutes() < 10 ? '0' + minDate.getMinutes() : minDate.getMinutes()) + ".\n\nCe d\u00E9lai diminuera au fur et \u00E0 mesure que d'autres utilisateurs approuveront vos constats...\n\nEn plus d'augmenter votre score !!!" });
        }
        var report = new report_model_1.Report(req.body);
        if (!report.created)
            report.created = new Date();
        report._creator = req.authUser._id;
        report.save(function (err, doc) {
            if (err) {
                console.log('save report error -> ', err);
                res.json({ success: false, message: 'Error with save report' });
                return;
            }
            ;
            req.authUser.reports++;
            req.authUser.lastReport = new Date();
            req.authUser.save();
            console.log('Report saved successfully');
            res.json({ success: true, report: doc.toJSON() });
        });
    },
    getAll: function (req, res) {
        //filters
        var dateFilter = parseInt(req.param("dateFilter", 4 /*DateFilter.none*/));
        var categoryFilter = req.param("categoryFilter", null);
        if (categoryFilter !== null)
            categoryFilter = parseInt(categoryFilter);
        var filter = {};
        if (dateFilter >= 0 /* DateFilter.day*/ && dateFilter < 4 /*DateFilter.none*/) {
            var date = new Date();
            date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            switch (dateFilter) {
                case 0 /*DateFilter.day*/:
                    date = new Date(date.setDate(date.getDate() - 1));
                    break;
                case 1 /*DateFilter.week*/:
                    date = new Date(date.setDate(date.getDate() - 7));
                    break;
                case 2 /*DateFilter.month*/:
                    date = new Date(date.setMonth(date.getMonth() - 1));
                    break;
                case 3 /*DateFilter.year*/:
                    date = new Date(date.setFullYear(date.getFullYear() - 1));
                    break;
            }
            filter.created = { $gte: date };
        }
        if (categoryFilter != null) {
            filter.category = categoryFilter;
        }
        report_model_1.Report.find(filter)
            .sort({ created: -1 })
            .populate('_creator')
            .exec(function (err, docs) {
            if (err)
                return console.log(err);
            var docsReady = docs.map(function (report) { return report.toJSON(); });
            res.json(docsReady);
        });
    },
    getAllByUserId: function (req, res) {
        report_model_1.Report.find({ _creator: req.user._id })
            .sort({ created: -1 })
            .populate('_creator')
            .exec(function (err, docs) {
            if (err)
                return console.log(err);
            var docsReady = docs.map(function (report) { return report.toJSON(); });
            res.json(docsReady);
        });
    },
    approve: function (req, res) {
        var report = req.report; //declare as any to avoid TS2339 error
        if (report.approved.findIndex(function (id) { return id.toString() == req.authUser._id; }) == -1 &&
            report.disapproved.findIndex(function (id) { return id.toString() == req.authUser._id; }) == -1) {
            report.approved.push(req.authUser._id);
            report._creator.approvals++;
            report._creator.save();
            report.save()
                .then(function (newreport) { return res.send({ success: true, report: newreport }); })["catch"](function (err) { return helper_controller_1.helperController.handleError(req, res, err); });
        }
        else
            helper_controller_1.helperController.handleError(req, res, 'Constat déjà évalué');
    },
    disapprove: function (req, res) {
        var report = req.report; //declare as any to avoid TS2339 error
        if (report.approved.findIndex(function (id) { return id.toString() == req.authUser._id; }) == -1 &&
            report.disapproved.findIndex(function (id) { return id.toString() == req.authUser._id; }) == -1) {
            report.disapproved.push(req.authUser._id);
            report._creator.disapprovals++;
            report._creator.save();
            report.save()
                .then(function (newreport) { return res.send({ success: true, report: newreport }); })["catch"](function (err) { return helper_controller_1.helperController.handleError(req, res, err); });
        }
        else
            helper_controller_1.helperController.handleError(req, res, 'Constat déjà évalué');
    },
    checkRID: function (req, res, next, rid) {
        report_model_1.Report.findById(helper_controller_1.helperController.toObjectId(rid))
            .populate('_creator')
            .then(function (report) {
            if (!report) {
                return res.status(404 /* Not Found */).send();
            }
            else {
                //add report to request
                req.report = report;
                return next();
            }
        })["catch"](next);
    }
};
