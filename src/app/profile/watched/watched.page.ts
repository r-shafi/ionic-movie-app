import { Component } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-watched',
  templateUrl: './watched.page.html',
})
export class WatchedPage {
  watchedMovies$ = this.profileService.watchedMovies$;
  watchedTv$ = this.profileService.watchedTv$;
  activeTab: 'movies' | 'tv' = 'movies';

  constructor(public profileService: ProfileService) {}

  remove(item: any) {
    this.profileService.toggleWatched(item);
  }
}
