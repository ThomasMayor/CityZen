import * as mongoose from 'mongoose';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

import { helperController } from '../helper.controller';
import { User, IUserModel } from './user.model';

// Import config
import { SECRET_TOKEN_KEY, BCRYPT_ROUND, PASSWORD_MIN_LENGHT, JWT_EXPIRE} from "../../config";



export const userController = {
  // Route to add mokup user in MongoDB
  /*
    User connection info:
      email:  aa@aa.ch
      pwd:    A123456
  */
	/*setup : (req:any,res:any) => {
    // Use bcrypte to encrypte user password
    bcrypt.hash('A123456', BCRYPT_ROUND, (err, hash) =>{
      if(err){
        res.json({ success: false, message: 'Error with bcrypt hash password' });
        return
      }
      // Store hash in your password DB.
      // create a sample user
      //(new User(<IUserModel>req.body))
      var newuser = <IUserModel>new User({
        email: 'aa@aa.ch',
        name: 'Thomas Mayor',
        password: hash,
        admin: true,
        created: new Date(),
        profilePicture: '',
      });
      newuser.save((err, doc:IUserModel) => {
  			if(err) {
          res.json({ success: false, message: 'Error with save user mokup' });
          return;
        };
        console.log('User saved successfully');
        res.json({ success: true, user: newuser.toJSON() });
  		})
    });
	},*/
  signToken(user) {
    let userToken:any = user.toJSON();
    userToken.profilePicture = '';
    userToken.email = '';
    let token = jwt.sign(userToken, SECRET_TOKEN_KEY, {
      expiresIn: JWT_EXPIRE // expires in 24 hours
    });
    return token;
  },
	signup : (req:any,res:any) =>{
		//(new User(<IUserModel>req.body))
    // check existe user in DB
    // before add new user
    // find the user
    userController
      .checkNameEmailExists(req.body.email, req.body.name)
      .then((result:any) => {
          if (result.emailExists || result.nameExists) {
              let msg = '';
             if (result.emailExists && result.nameExists) {
               msg = "L'email et le nom sont déjà utilisés.";
             }
             else if (result.nameExists) {
               msg = "Le nom est déjà utilisé.";
             }
             else {
               msg = "L'email est déjà utilisé.";
             }
             return helperController.handleError(req, res, msg);
          }


        // No existing user found, create the new user
        // Check password length is >= 6
        if(req.body.password.length < PASSWORD_MIN_LENGHT) {
          return helperController.handleError(req, res, `Le mot de passe doit être composé de ${PASSWORD_MIN_LENGHT} caractères au minimum.`);
        }
        // Use bcrypte to encrypte user password
        bcrypt.hash(req.body.password, BCRYPT_ROUND, (err, hash) =>{
          if(err) {
            console.log('Error with bcrypt hash password', err);
            return helperController.handleError(req, res, `Erreur d'encryption.`);
          }
          // create user
          var newuser = <IUserModel>new User({
            email: req.body.email,
            password: hash,
            name: req.body.name,
            admin: false,
            created: new Date(),
            profilePicture: '',
          });
          newuser.save((err, doc:IUserModel) => {
      			if(err) {
              return helperController.handleError(req, res, err);
            }
            console.log('User created successfully');
            let token = userController.signToken(newuser);
            res.json({ success: true, message: 'Bienvenue', token: token, user: newuser.toJSON() });
      		})
        })
    });
  },

  isAuth: (req:any,res:any)=> {
    let token = userController.signToken(req.authUser);
    res.json({ success: true, message: 'Succès', token: token, user: req.authUser.toJSON()});
  },

  auth: (req:any,res:any)=> {
    // find the user
    User.findOne({email: req.body.email}, (err, user:IUserModel)=> {
      if (err)
        return helperController.handleError(req, res, `Erreur interne`, 500);

      if (!user) {
        return helperController.handleError(req, res, `Echec de l'authentification.`);
      }
      // check if password matches
      // Load hash from your password DB.
      // Use bcrypte to compare user password with hash
      bcrypt.compare(req.body.password, user.password, (err, result)=> {
          if(err || result === false){
            return helperController.handleError(req, res, `Echec de l'authentification.`);
          }

          // if user is found and password is right
          // create a token
          let token = userController.signToken(user);
          res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token,
            user: user.toJSON()
          });
      });
    });
  },

  getAllByScore : (req:any,res:any) => {
		User.find()
        .sort({ score: -1 })
        .exec((err, docs:IUserModel[]) => {
			if(err)
        return helperController.handleError(req, res, `Impossible de charger les utilisateurs.`);
      let docsReady = docs.map((user)=> user.toJSON());
			res.json({success: true, users:docsReady});
		})
  },

  getUser: (req:any,res:any) => {
    res.json({ success: false, user: req.user.toJSON()});
  },

  checkNameEmailExists: (email: string, name: string, id?: any): Promise<{ nameExists: boolean, emailExists: boolean }> => {
    return new Promise((resolve, reject) => {
      User.find( { $or: [ { email: email }, { name: name } ] } )
          .then((docs: any) => {
            let result = { nameExists: false, emailExists: false };
            if (docs.length) {
              docs.forEach((user:any) => {
                if (id && user._id.toString() == id.toString())
                  return;
                if (user.email == email)
                  result.emailExists = true;
                if (user.name == name)
                  result.nameExists = true;
              });
            }
            resolve(result);
          })
          .catch(reject);
    })
  },


  patchUser: (req:any, res:any) => {
    let user:IUserModel = req.user;
    if (!req.authUser.admin && req.authUser._id != user._id) {
      return helperController.handleError(req, res, `Vous n'avez pas le droit de modifier cet utilisateur.`, 403);
    }

    if (req.body) {
      let email = req.body.email ? req.body.email : 'NotAnEmail';
      let name = req.body.name ? req.body.name : '';
      // NOTE : this.checkNameEmailExists is undefined
      userController.checkNameEmailExists(email, name, user._id)
          .then((result:any) => {
            if (result.emailExists || result.nameExists) {
                let msg = '';
               if (result.emailExists && result.nameExists) {
                 msg = "L'email et le nom sont déjà utilisés.";
               }
               else if (result.nameExists) {
                 msg = "Le nom est déjà utilisé.";
               }
               else {
                 msg = "L'email est déjà utilisé.";
               }

               return res.send({success: false, message: msg});
            }
            if (req.body.email)
              user.email = req.body.email;
            if (req.body.name)
              user.name = req.body.name;
            if (req.body.profilePicture)
              user.profilePicture = req.body.profilePicture;


            const callback = (err:any, hash:string) => {
              if(err){
                console.log('Error with bcrypt hash password', err);
                helperController.handleError(req, res, 'Erreur interne', 500);
                return
              }
              if (hash)
                user.password = hash;
              user.save((err:any, newuser:IUserModel) => {
          			if(err)
                  return helperController.handleError(req, res, 'Erreur interne');

                let result: any = { success: true, message: 'Modification effectuée' };
                //if for current logged in user, generate new token
                if (user._id == req.authUser._id) {
                  let token = userController.signToken(newuser);
                  result.token = token;
                }
                result.user = newuser.toJSON();
                res.json(result);

          		})

            }

            //does user want to change password ?
            if (req.body.password) {
              bcrypt.hash(req.body.password, BCRYPT_ROUND, callback);
            }
            else {
              callback('','');
            }
          });
    }
    else
      helperController.handleError(req, res, 'Requête invalide', 400);
  },


  checkJWT: (req:any, jwtuser:any, next:any) => {
    User.findById(helperController.toObjectId(jwtuser._id)).then(user => {
      if (!user) {
        next(null, false);
       } else {
        req.authUser = user;
        next(null, user);
      }
    }).catch(next)
  },

  checkUID: (req:any, res:any, next:any, uid:any) => {
    User.findById(helperController.toObjectId(uid)).then(user => {
        if (!user) {
            return res.status(404 /* Not Found */).send();
        } else {
            //add user to request
            req.user = user;
            return next();
        }
    }).catch(next);
  }
}
