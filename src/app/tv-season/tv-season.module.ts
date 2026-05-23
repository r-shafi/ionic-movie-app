import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TvSeasonPageRoutingModule } from './tv-season-routing.module';
import { TvSeasonPage } from './tv-season.page';

@NgModule({
  declarations: [TvSeasonPage],
  imports: [CommonModule, IonicModule, TvSeasonPageRoutingModule],
})
export class TvSeasonPageModule {}
