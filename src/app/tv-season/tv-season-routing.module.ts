import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TvSeasonPage } from './tv-season.page';

const routes: Routes = [{ path: '', component: TvSeasonPage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TvSeasonPageRoutingModule {}
