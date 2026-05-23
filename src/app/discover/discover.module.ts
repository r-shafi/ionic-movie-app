import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { DiscoverPageRoutingModule } from './discover-routing.module';
import { DiscoverPage } from './discover.page';

@NgModule({
  declarations: [DiscoverPage],
  imports: [
    CommonModule,
    IonicModule,
    DiscoverPageRoutingModule,
    SharedModuleModule,
  ],
})
export class DiscoverPageModule {}
