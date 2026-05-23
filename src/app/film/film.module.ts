import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SharedModuleModule } from '../shared-module/shared-module.module';
import { FilmPageRoutingModule } from './film-routing.module';

import { FilmPage } from './film.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FilmPageRoutingModule,
    SharedModuleModule,
  ],
  declarations: [FilmPage],
})
export class FilmPageModule {}
