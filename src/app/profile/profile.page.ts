import { Component } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { SettingsService } from '../services/settings.service';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.page.html',
    styleUrls: ['./profile.page.scss'],
    standalone: false
})
export class ProfilePage {
  watchedMovies$ = this.profileService.watchedMovies$;
  watchedTv$ = this.profileService.watchedTv$;
  favoriteMovies$ = this.profileService.favoriteMovies$;
  favoriteTv$ = this.profileService.favoriteTv$;
  watchlist$ = this.profileService.watchlist$;
  ratings$ = this.profileService.ratings$;
  customLists$ = this.profileService.customLists$;
  activity$ = this.profileService.activity$;

  activeTab: 'overview' | 'activity' | 'lists' = 'overview';

  constructor(
    public profileService: ProfileService,
    private settingsService: SettingsService,
  ) {}

  get displayName(): string {
    return this.settingsService.getSettings().displayName;
  }

  get totalHours(): number {
    return this.profileService.getTotalHoursWatched();
  }

  get ratingDistribution(): Record<number, number> {
    return this.profileService.getRatingDistribution();
  }

  navigateToRoute(route: string) {
    window.location.href = route;
  }

  createList() {
    const name = prompt('List name:');
    if (name) {
      this.profileService.createList(name);
    }
  }

  deleteList(id: string) {
    if (confirm('Delete this list?')) {
      this.profileService.deleteList(id);
    }
  }
}
