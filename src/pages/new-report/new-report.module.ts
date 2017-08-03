import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NewReportPage } from './new-report';
import { FormMessageComponentModule }  from '../../components/form-message/form-message.module';
import { SmartImagePickerComponentModule }  from '../../components/smart-image-picker/smart-image-picker.module';


@NgModule({
  declarations: [
    NewReportPage,
  ],
  imports: [
    IonicPageModule.forChild(NewReportPage),
    FormMessageComponentModule,
    SmartImagePickerComponentModule,
  ],
  providers: [
  ]
})
export class NewReportPageModule {}
