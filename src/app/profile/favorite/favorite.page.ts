import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-favorite',
    templateUrl: './favorite.page.html',
    standalone: false
})
export class FavoritePage {
  favoriteMovies$ = this.profileService.favoriteMovies$;
  favoriteTv$ = this.profileService.favoriteTv$;
  activeTab: 'movies' | 'tv' = 'movies';

  constructor(public profileService: ProfileService) {}

  remove(item: any) {
    this.profileService.toggleFavorite(item);
  }
}
