import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { LikedPageRoutingModule } from './liked-routing.module';
import { LikedPage } from './liked.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LikedPageRoutingModule,
    SharedModuleModule,
  ],
  declarations: [LikedPage],
})
export class LikedPageModule {}
