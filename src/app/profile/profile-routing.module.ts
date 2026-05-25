import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ProfilePage } from './profile.page';

const routes: Routes = [
  {
    path: '',
    component: ProfilePage,
  },
  {
    path: 'watched',
    loadChildren: () =>
      import('./watched/watched.module').then((m) => m.WatchedPageModule),
  },
  {
    path: 'favorite',
    loadChildren: () =>
      import('./favorite/favorite.module').then((m) => m.FavoritePageModule),
  },
  {
    path: 'watchlist',
    loadChildren: () =>
      import('./watchlist/watchlist.module').then((m) => m.WatchlistPageModule),
  },
  {
    path: 'liked',
    loadChildren: () =>
      import('./liked/liked.module').then((m) => m.LikedPageModule),
  },
  {
    path: 'diary',
    loadChildren: () =>
      import('./diary/diary.module').then((m) => m.DiaryPageModule),
  },
  {
    path: 'ratings',
    loadChildren: () =>
      import('./ratings/ratings.module').then((m) => m.RatingsPageModule),
  },
  {
    path: 'reviews',
    loadChildren: () =>
      import('./user-reviews/user-reviews.module').then(
        (m) => m.UserReviewsPageModule,
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfilePageRoutingModule {}
