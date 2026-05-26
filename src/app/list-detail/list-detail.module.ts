import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { ListDetailPageRoutingModule } from './list-detail-routing.module';
import { ListDetailPage } from './list-detail.page';

@NgModule({
  declarations: [ListDetailPage],
  imports: [CommonModule, IonicModule, ListDetailPageRoutingModule, SharedModuleModule],
})
export class ListDetailPageModule {}
