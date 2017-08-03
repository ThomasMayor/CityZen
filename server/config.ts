
import { devVariables } from '../environments/development';
import { prodVariables } from '../environments/production';
import { IEnvironment } from "../environments/env-model";

declare const process:any;

export function environmentConfig():IEnvironment {
  let env = devVariables;
  if(process.env.NODE_ENV === 'prod'){env = prodVariables}
  return env;
}

export const SECRET_TOKEN_KEY: string = 'secret token key';
export const DB_HOST: string = environmentConfig().dbHost;
export const DB_NAME: string = environmentConfig().dbName;
export const BCRYPT_ROUND: number = 10;
export const PASSWORD_MIN_LENGHT: number = 6;
export const JWT_EXPIRE: number = 8640000; //10 days
