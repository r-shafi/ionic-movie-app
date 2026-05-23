import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ListDetailPageRoutingModule } from './list-detail-routing.module';
import { ListDetailPage } from './list-detail.page';

@NgModule({
  declarations: [ListDetailPage],
  imports: [CommonModule, IonicModule, ListDetailPageRoutingModule],
})
export class ListDetailPageModule {}
