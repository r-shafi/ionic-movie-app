import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UserDataService, WatchlistEntry } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WatchlistPage {
  constructor(public userData: UserDataService) {}

  get watchlist(): WatchlistEntry[] {
    return this.userData.getWatchlist();
  }

  remove(item: WatchlistEntry) {
    this.userData.removeFromWatchlist(item.media_type, item.id);
  }
}
