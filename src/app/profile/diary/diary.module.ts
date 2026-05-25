import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { DiaryPageRoutingModule } from './diary-routing.module';
import { DiaryPage } from './diary.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    DiaryPageRoutingModule,
    SharedModuleModule,
  ],
  declarations: [DiaryPage],
})
export class DiaryPageModule {}
