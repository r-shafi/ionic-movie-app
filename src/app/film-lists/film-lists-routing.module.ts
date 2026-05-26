import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FilmListsPage } from './film-lists.page';

const routes: Routes = [{ path: '', component: FilmListsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilmListsPageRoutingModule {}
