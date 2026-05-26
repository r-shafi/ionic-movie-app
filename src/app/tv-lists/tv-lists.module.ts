import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TvListsPageRoutingModule } from './tv-lists-routing.module';
import { TvListsPage } from './tv-lists.page';

@NgModule({
  declarations: [TvListsPage],
  imports: [CommonModule, IonicModule, TvListsPageRoutingModule],
})
export class TvListsPageModule {}
