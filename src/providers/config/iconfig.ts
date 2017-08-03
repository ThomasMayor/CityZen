import { devVariables } from '../../../environments/development';
import { prodVariables } from '../../../environments/production';
import { IEnvironment } from "../../../environments/env-model";

declare const process:any;

export function environmentConfig():IEnvironment {
  let env = prodVariables;
  if(process.env.IONIC_ENV !== 'prod'){env = devVariables}
  return env;
}

export interface IConfigProvider {
  API_URL: string;
  GOOGLE_API_KEY: string;
}
