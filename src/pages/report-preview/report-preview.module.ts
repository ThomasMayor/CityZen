import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportPreviewPage } from './report-preview';
import { PipesModule } from '../../pipes/pipes.module';


@NgModule({
  declarations: [
    ReportPreviewPage,
  ],
  imports: [
    IonicPageModule.forChild(ReportPreviewPage),
    PipesModule,
  ],
  exports: [
    ReportPreviewPage
  ],
  providers: [
  ]
})
export class ReportPreviewPageModule {}
