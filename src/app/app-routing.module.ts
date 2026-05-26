import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  {
    path: 'movie/:id',
    loadChildren: () =>
      import('./film/film.module').then((m) => m.FilmPageModule),
  },
  {
    path: 'movie/:id/reviews',
    loadChildren: () =>
      import('./reviews/reviews.module').then((m) => m.ReviewsPageModule),
  },
  {
    path: 'tv/:id',
    loadChildren: () => import('./tv/tv.module').then((m) => m.TvPageModule),
  },
  {
    path: 'tv/:id/reviews',
    loadChildren: () =>
      import('./reviews/reviews.module').then((m) => m.ReviewsPageModule),
  },
  {
    path: 'tv/:id/season/:seasonNumber',
    loadChildren: () =>
      import('./tv-season/tv-season.module').then((m) => m.TvSeasonPageModule),
  },
  {
    path: 'person/:id',
    loadChildren: () =>
      import('./person/person.module').then((m) => m.PersonPageModule),
  },
  {
    path: 'settings',
    loadChildren: () =>
      import('./settings/settings.module').then((m) => m.SettingsPageModule),
  },
  {
    path: 'list/:id',
    loadChildren: () =>
      import('./list-detail/list-detail.module').then(
        (m) => m.ListDetailPageModule,
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
