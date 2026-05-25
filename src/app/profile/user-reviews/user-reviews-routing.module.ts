import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserReviewsPage } from './user-reviews.page';

const routes: Routes = [
  {
    path: '',
    component: UserReviewsPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserReviewsPageRoutingModule {}
