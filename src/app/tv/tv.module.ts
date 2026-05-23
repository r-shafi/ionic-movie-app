import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { TvPageRoutingModule } from './tv-routing.module';
import { TvPage } from './tv.page';

@NgModule({
  declarations: [TvPage],
  imports: [CommonModule, IonicModule, TvPageRoutingModule, SharedModuleModule],
})
export class TvPageModule {}
