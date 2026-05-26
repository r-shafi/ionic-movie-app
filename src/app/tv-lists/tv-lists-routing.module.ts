import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TvListsPage } from './tv-lists.page';

const routes: Routes = [{ path: '', component: TvListsPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TvListsPageRoutingModule {}
