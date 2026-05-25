import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { RatingsPageRoutingModule } from './ratings-routing.module';
import { RatingsPage } from './ratings.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RatingsPageRoutingModule,
    SharedModuleModule,
  ],
  declarations: [RatingsPage],
})
export class RatingsPageModule {}
