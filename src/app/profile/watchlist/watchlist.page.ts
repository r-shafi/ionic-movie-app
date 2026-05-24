import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-watchlist',
    templateUrl: './watchlist.page.html',
    standalone: false
})
export class WatchlistPage {
  watchlist$ = this.profileService.watchlist$;

  constructor(public profileService: ProfileService) {}

  remove(item: any) {
    this.profileService.addToWatchlist(item); // toggles off if present
  }
}
