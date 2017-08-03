import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HallOfFamePage } from './hall-of-fame';

@NgModule({
  declarations: [
    HallOfFamePage,
  ],
  imports: [
    IonicPageModule.forChild(HallOfFamePage),
  ],
})
export class HallOfFamePageModule {}
