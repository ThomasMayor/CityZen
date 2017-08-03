import * as mongoose from 'mongoose';

import { Report, IReportModel } from './report.model';
import { User, IUserModel } from '../users/user.model';
import { helperController } from '../helper.controller';
import { DateFilter } from '../../../src/models/filter';
import { userScore } from '../../../src/models/user';

export const reportController = {
  insert : (req:any,res:any) => {
    //check user has right to add report
      //compute score
      //check lastreport date
    let score = userScore.compute(req.authUser);

    let minDate = req.authUser.lastReport;
    let now = new Date();
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
    minDate = new Date(1999,0, 1);
    if (now.valueOf() < minDate.valueOf()) {
      let month = '';
      switch(minDate.getMonth()) {
        case 0 : month = 'janvier'; break;
        case 1 : month = 'fvrier'; break;
        case 2 : month = 'mars'; break;
        case 3 : month = 'avril'; break;
        case 4 : month = 'mai'; break;
        case 5 : month = 'juin'; break;
        case 6 : month = 'juillet'; break;
        case 7 : month = 'août'; break;
        case 8 : month = 'septembre'; break;
        case 9 : month = 'octobre'; break;
        case 10 : month = 'novembre'; break;
        case 11 : month = 'décembre'; break;
      }
      return res.json({ success: false, needwait: true,  message: `Avant de pouvoir créer un nouveau constat, il vous reste à patienter jusqu'au ${minDate.getDate() + (minDate.getDate() == 1 ? 'er' : '')} ${month} ${minDate.getFullYear()} à ${minDate.getHours() < 10 ? '0' + minDate.getHours() : minDate.getHours()}h${minDate.getMinutes() < 10 ? '0' + minDate.getMinutes() : minDate.getMinutes()}.\n\nCe délai diminuera au fur et à mesure que d'autres utilisateurs approuveront vos constats...\n\nEn plus d'augmenter votre score !!!` });
    }

    var report = <IReportModel>new Report(req.body);
    if (!report.created)
      report.created = new Date();
    report._creator = req.authUser._id;
    report.save((err, newreport:IReportModel) => {
      if(err) {
        return helperController.handleError(req, res, 'Impossible de sauver le constat');
      };
      req.authUser.reports++;
      req.authUser.lastReport = new Date();
      console.dir(userScore.compute(req.authUser));
      req.authUser.score = userScore.compute(req.authUser);
      console.log('trying to save', req.authUser);
      req.authUser.save((err, doc:IUserModel) => {
        if(err) {
          return helperController.handleError(req, res, `Impossible de sauver l'utilisateur ${err} ${req.authUser.score}`);
        }
        res.json({ success: true, report: newreport.toJSON() });
      });
    })
  },

  getAll : (req:any,res:any) => {
    //filters
    let dateFilter = req.query.dateFilter;
    dateFilter = typeof dateFilter == "object" && Object.keys(dateFilter).length ? parseInt(dateFilter) : DateFilter.none;
    let categoryFilter = req.query.categoryFilter;
    categoryFilter = typeof categoryFilter == "object" && Object.keys(categoryFilter).length ? parseInt(categoryFilter) : null;

    let filter: any = {  };
    if (dateFilter >= DateFilter.day && dateFilter < DateFilter.none) {
      let date = new Date();
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      switch(dateFilter) {
        case DateFilter.day :
          date = new Date(date.setDate(date.getDate() - 1))
          break;
        case DateFilter.week :
          date = new Date(date.setDate(date.getDate() - 7))
          break;
        case DateFilter.month :
          date = new Date(date.setMonth(date.getMonth() - 1))
          break;
        case DateFilter.year :
          date = new Date(date.setFullYear(date.getFullYear() - 1))
          break;
      }
      filter.created = {$gte: date};
    }
    if (categoryFilter != null) {
      filter.category = categoryFilter;
    }
		Report.find(filter)
          .sort({ created: -1 })
          .populate('_creator')
          .exec((err, docs:IReportModel[])=> {
			if(err)
        return helperController.handleError(req, res, `Impossible de retrouver les constats`);
      let docsReady = docs.map((report) => report.toJSON());
			res.json({ success: true, reports: docsReady });
		})
  },

  getAllByUserId : (req:any, res:any) => {
    Report.find({ _creator: req.user._id })
          .sort({ created: -1 })
          .populate('_creator')
          .exec((err, docs:IReportModel[])=> {
      if(err)
        return helperController.handleError(req, res, `Impossible de retrouver les constats`);
      let docsReady = docs.map((report) => report.toJSON());
      res.json({ success: true, reports: docsReady });
    })
  },

  approve : (req:any, res:any) => {
    let report: any = req.report; //declare as any to avoid TS2339 error
    if (report.approved.findIndex((id:any) => id.toString() == req.authUser._id) == -1 &&
        report.disapproved.findIndex((id:any) => id.toString() == req.authUser._id) == -1) {
      report.approved.push(req.authUser._id);
      report._creator.approvals++;
      report._creator.score = userScore.compute(report._creator);
      report._creator.save();

      report.save()
            .then((newreport:IReportModel) => res.send({ success: true, report: newreport }))
            .catch((err:any) => helperController.handleError(req, res, err));
    }
    else
      helperController.handleError(req, res, 'Constat déjà évalué');
  },

  disapprove : (req:any, res:any) => {
    let report: any = req.report; //declare as any to avoid TS2339 error
    if (report.approved.findIndex((id:any) => id.toString() == req.authUser._id) == -1 &&
        report.disapproved.findIndex((id:any) => id.toString() == req.authUser._id) == -1) {
      report.disapproved.push(req.authUser._id);
      report._creator.disapprovals++;
      report._creator.score = userScore.compute(report._creator);
      report._creator.save();
      report.save()
            .then((newreport:IReportModel) => res.send({ success: true, report: newreport }))
            .catch((err:any) => helperController.handleError(req, res, err));
    }
    else
      helperController.handleError(req, res, 'Constat déjà évalué');
  },

  checkRID: (req:any, res:any, next:any, rid:any) => {
    Report.findById(helperController.toObjectId(rid))
          .populate('_creator')
          .then(report => {
        if (!report) {
            return res.status(404 /* Not Found */).send();
        } else {
            //add report to request
            req.report = report;
            return next();
        }
    }).catch(next);
  }

}
