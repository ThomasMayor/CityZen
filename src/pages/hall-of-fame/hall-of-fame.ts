import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Observable } from 'rxjs';
import { UserProvider } from '../../providers/user/user';

/**
 * Generated class for the HallOfFamePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-hall-of-fame',
  templateUrl: 'hall-of-fame.html',
})
export class HallOfFamePage {

  private users:Observable<any>;

  constructor(private navCtrl: NavController,
              private userProvider: UserProvider) {
    this.users = this.userProvider.usersByScore$;
    this.userProvider.loadAllByScore();
  }

  getProfileImageStyle(user): string {
    if (!user.profilePicture)
      return `url('assets/img/noprofilepic.png')`;
    return `url(${user.profilePicture})`;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HallOfFamePage');
  }

  showProfile(user) {
    this.navCtrl.push('ProfilPage', { user: user });
  }

}
