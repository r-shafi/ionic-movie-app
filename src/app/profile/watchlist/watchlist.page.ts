import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import {
  UserDataService,
  WatchlistEntry,
} from 'src/app/services/user-data.service';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class WatchlistPage {
  activeTab: 'all' | 'movie' | 'tv' = 'all';
  searchTerm = '';

  constructor(
    public userData: UserDataService,
    private actionSheetCtrl: ActionSheetController,
    private router: Router,
  ) {}

  get watchlist(): WatchlistEntry[] {
    return this.userData.getWatchlist();
  }

  get filteredWatchlist(): WatchlistEntry[] {
    const base =
      this.activeTab === 'all'
        ? this.watchlist
        : this.watchlist.filter((item) => item.media_type === this.activeTab);

    const q = this.searchTerm.trim().toLowerCase();
    if (!q) {
      return base;
    }
    return base.filter((item) => item.title.toLowerCase().includes(q));
  }

  poster(item: WatchlistEntry): string {
    return item.poster_path
      ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
      : 'assets/no-image.png';
  }

  addedOn(item: WatchlistEntry): string {
    return new Date(item.addedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  remove(item: WatchlistEntry) {
    this.userData.removeFromWatchlist(item.media_type, item.id);
  }

  async openEntryActions(event: Event, item: WatchlistEntry) {
    event.preventDefault();
    event.stopPropagation();

    const actionSheet = await this.actionSheetCtrl.create({
      header: item.title,
      buttons: [
        {
          text: 'Open details',
          icon: 'open-outline',
          handler: () => {
            this.router.navigate(
              item.media_type === 'tv' ? ['/tv', item.id] : ['/movie', item.id],
            );
          },
        },
        {
          text: 'Remove from watchlist',
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => this.remove(item),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        },
      ],
    });

    await actionSheet.present();
  }
}
