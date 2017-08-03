import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { Observable, BehaviorSubject } from "rxjs";
import 'rxjs/add/operator/map';

import { IUser } from '../../models/user'
import { ApiEndPointsProvider } from '../api-end-points/api-end-points'

/*
  Generated class for the UserProvider provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular DI.
*/
@Injectable()
export class UserProvider {

  private usersByScore = new BehaviorSubject<IUser[]>([]);
  public usersByScore$: Observable<IUser[]> = this.usersByScore.asObservable();

  constructor(public http: Http,
              private endpoints: ApiEndPointsProvider,
              private authHttp: AuthHttp) {
    console.log('Hello UserProvider Provider');
  }

  loadAllByScore() {
    return new Promise((resolve, reject) => {
      this.authHttp.get(this.endpoints.users + '/score')
                   .map(res => res.json())
                   .take(1)
                   .subscribe(
                     data => {
                       console.log('loadAllByScore', data)
                       if (!data.success)
                          return reject(data.message);
                       this.usersByScore.next(data.users);
                       resolve(data.users);
                     },
                     err => reject(err)
                   );
    })

  }

  create(user: IUser): Observable<any> {
    return this.http.post(this.endpoints.signup, user)
      .map(response => response.json())

  }

  update(user: any, id: string): Observable<any> {
    return this.authHttp.patch(this.endpoints.users + `/${id}`, user)
      .map(response => response.json())
  }

}
