import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserDataService, FavoriteEntry } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class FavoritePage {
  activeTab: 'movies' | 'tv' = 'movies';

  constructor(public userData: UserDataService) {}

  get favorites(): FavoriteEntry[] {
    return this.userData.getFavorites();
  }

  get movieFavorites(): FavoriteEntry[] {
    return this.favorites.filter((f) => f.media_type === 'movie');
  }

  get tvFavorites(): FavoriteEntry[] {
    return this.favorites.filter((f) => f.media_type === 'tv');
  }

  remove(item: FavoriteEntry) {
    this.userData.removeFavorite(item.media_type, item.id);
  }
}
