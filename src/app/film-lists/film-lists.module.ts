import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FilmListsPageRoutingModule } from './film-lists-routing.module';
import { FilmListsPage } from './film-lists.page';

@NgModule({
  declarations: [FilmListsPage],
  imports: [CommonModule, IonicModule, FilmListsPageRoutingModule],
})
export class FilmListsPageModule {}
