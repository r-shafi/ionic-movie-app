import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserDataService, WatchedEntry } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-watched',
  templateUrl: './watched.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WatchedPage {
  activeTab: 'movies' | 'tv' = 'movies';

  constructor(public userData: UserDataService) {}

  get watched(): WatchedEntry[] {
    const all = Object.values(this.userData.getWatched());
    return all.sort((a, b) => b.watchedAt.localeCompare(a.watchedAt));
  }

  get movieWatched(): WatchedEntry[] {
    return this.watched.filter((e) => e.media_type === 'movie');
  }

  get tvWatched(): WatchedEntry[] {
    return this.watched.filter((e) => e.media_type === 'tv');
  }

  remove(item: WatchedEntry) {
    this.userData.removeWatched(item.media_type, item.id);
  }
}
