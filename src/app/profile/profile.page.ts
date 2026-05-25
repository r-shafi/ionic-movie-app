import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import {
  FavoriteEntry,
  UserDataService,
  UserList,
  WatchedEntry,
} from '../services/user-data.service';
import { AddFavoriteModalComponent } from './add-favorite-modal/add-favorite-modal.component';
import { EditProfileComponent } from './edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProfilePage {
  activeTab: 'stats' | 'activity' | 'lists' = 'stats';
  activityPage = 0;
  readonly pageSize = 20;
  readonly quickLinks = [
    {
      label: 'Watched',
      icon: 'eye-outline',
      route: '/profile/watched',
      subtitle: 'All logged titles',
      countGetter: () => this.stats.totalWatched,
    },
    {
      label: 'Watchlist',
      icon: 'bookmark-outline',
      route: '/profile/watchlist',
      subtitle: 'What to watch next',
      countGetter: () => this.userData.getWatchlist().length,
    },
    {
      label: 'Liked',
      icon: 'heart-outline',
      route: '/profile/liked',
      subtitle: 'Films and shows you liked',
      countGetter: () => this.watchedEntries.filter((e) => e.liked).length,
    },
    {
      label: 'Diary',
      icon: 'calendar-clear-outline',
      route: '/profile/diary',
      subtitle: 'Logs by watch date',
      countGetter: () => this.watchedEntries.length,
    },
    {
      label: 'Ratings',
      icon: 'star-outline',
      route: '/profile/ratings',
      subtitle: 'Your scored entries',
      countGetter: () =>
        this.watchedEntries.filter((e) => e.rating !== null).length,
    },
    {
      label: 'Reviews',
      icon: 'chatbubble-ellipses-outline',
      route: '/profile/reviews',
      subtitle: 'Written thoughts',
      countGetter: () =>
        this.watchedEntries.filter((e) => !!e.review.trim()).length,
    },
  ];

  constructor(
    public userData: UserDataService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
  ) {}

  get profile() {
    return this.userData.getProfile();
  }

  get stats() {
    return this.userData.getStats();
  }

  get favorites(): FavoriteEntry[] {
    return this.userData.getFavorites();
  }

  get watchedEntries(): WatchedEntry[] {
    const entries = Object.values(this.userData.getWatched());
    return entries.sort((a, b) => b.watchedAt.localeCompare(a.watchedAt));
  }

  get visibleActivity(): WatchedEntry[] {
    return this.watchedEntries.slice(
      0,
      (this.activityPage + 1) * this.pageSize,
    );
  }

  get hasMoreActivity(): boolean {
    return this.visibleActivity.length < this.watchedEntries.length;
  }

  get allLists(): UserList[] {
    return this.userData.getLists();
  }

  get recentActivityEntries(): WatchedEntry[] {
    return this.watchedEntries.slice(0, 5);
  }

  get previewLists(): UserList[] {
    return this.allLists.slice(0, 3);
  }

  quickLinkCount(getter: () => number): number {
    return getter();
  }

  get monthGroups(): { month: string; entries: WatchedEntry[] }[] {
    const groups: { month: string; entries: WatchedEntry[] }[] = [];
    const seen = new Set<string>();
    for (const entry of this.visibleActivity) {
      const d = new Date(entry.watchedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!seen.has(key)) {
        seen.add(key);
        groups.push({ month: key, entries: [] });
      }
      const group = groups.find((g) => g.month === key);
      if (group) {
        group.entries.push(entry);
      }
    }
    return groups;
  }

  loadMore(event: any) {
    this.activityPage++;
    event.target.complete();
    if (!this.hasMoreActivity) {
      event.target.disabled = true;
    }
  }

  async openEditProfile() {
    const modal = await this.modalCtrl.create({
      component: EditProfileComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
    await modal.onDidDismiss();
    this.cdr.markForCheck();
  }

  async openAddFavorite() {
    const modal = await this.modalCtrl.create({
      component: AddFavoriteModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await modal.present();
    await modal.onDidDismiss();
    this.cdr.markForCheck();
  }

  async createList() {
    const alert = await this.alertCtrl.create({
      header: 'New List',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'List name' },
        {
          name: 'description',
          type: 'text',
          placeholder: 'Description (optional)',
        },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data) => {
            if (data.name?.trim()) {
              this.userData.createList(
                data.name.trim(),
                data.description?.trim() || '',
              );
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteList(id: string) {
    const alert = await this.alertCtrl.create({
      header: 'Delete list?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => this.userData.deleteList(id),
        },
      ],
    });
    await alert.present();
  }

  statCards() {
    const s = this.stats;
    return [
      { label: 'Total Watched', value: s.totalWatched },
      { label: 'Total Hours', value: s.totalHoursEstimated },
      {
        label: 'Avg Rating',
        value: s.averageRating !== null ? s.averageRating.toFixed(1) : '-',
      },
      { label: 'Total Liked', value: s.likedCount },
    ];
  }

  get ratedEntriesCount(): number {
    return this.watchedEntries.filter((entry) => entry.rating !== null).length;
  }

  get unratedEntriesCount(): number {
    return this.stats.totalWatched - this.ratedEntriesCount;
  }

  get watchlistCount(): number {
    return this.userData.getWatchlist().length;
  }

  get averageRatingDisplay(): string {
    return this.stats.averageRating !== null
      ? this.stats.averageRating.toFixed(1)
      : '-';
  }

  get ratedCoverageDisplay(): string {
    return this.formatPercent(this.ratedEntriesCount, this.stats.totalWatched);
  }

  get likedRatioDisplay(): string {
    return this.formatPercent(this.stats.likedCount, this.stats.totalWatched);
  }

  get movieTvMixDisplay(): string {
    return `${this.stats.totalMovies}M / ${this.stats.totalTv}TV`;
  }

  get currentMonthWatchedCount(): number {
    const currentMonth = this.monthKey(new Date());
    const bucket = this.stats.watchedByMonth.find(
      (entry) => entry.month === currentMonth,
    );
    return bucket?.count || 0;
  }

  peakMonthLabel(): string {
    if (!this.stats.watchedByMonth.length) {
      return '-';
    }
    const best = [...this.stats.watchedByMonth].sort(
      (a, b) => b.count - a.count,
    )[0];
    if (!best || best.count === 0) {
      return '-';
    }
    return `${this.monthLabel(best.month)} ${best.month.split('-')[0]}`;
  }

  ratingRows(): Array<{ label: string; count: number; pct: number }> {
    const keys = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];
    const rows = keys.map((value) => {
      const label = value.toFixed(1);
      const count = this.stats.ratingsDistribution[label] || 0;
      return { label, count };
    });
    const max = Math.max(...rows.map((row) => row.count), 1);
    return rows.map((row) => ({ ...row, pct: (row.count / max) * 100 }));
  }

  monthMomentumRows(): Array<{ label: string; count: number; pct: number }> {
    const latest = this.stats.watchedByMonth.slice(-6);
    const max = Math.max(...latest.map((row) => row.count), 1);
    return latest.map((row) => ({
      label: this.monthLabel(row.month),
      count: row.count,
      pct: (row.count / max) * 100,
    }));
  }

  ratingBarHeight(count: number): number {
    const max = Math.max(...Object.values(this.stats.ratingsDistribution), 1);
    return max > 0 ? (count / max) * 100 : 0;
  }

  monthBarHeight(count: number): number {
    const max = Math.max(...this.stats.watchedByMonth.map((m) => m.count), 1);
    return max > 0 ? (count / max) * 100 : 0;
  }

  genreBarWidth(count: number): number {
    const max = Math.max(...this.stats.topGenres.map((g) => g.count), 1);
    return max > 0 ? (count / max) * 100 : 0;
  }

  monthLabel(iso: string): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const m = parseInt(iso.split('-')[1], 10);
    return months[m - 1] || iso;
  }

  getMonthLabel(iso: string): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const m = parseInt(iso.split('-')[1], 10);
    return months[m - 1] || iso;
  }

  entryRating(entry: WatchedEntry): string {
    if (entry.rating === null) {
      return '';
    }
    return `★${entry.rating}`;
  }

  entryPoster(entry: WatchedEntry): string {
    return entry.poster_path
      ? `https://image.tmdb.org/t/p/w92${entry.poster_path}`
      : 'assets/no-image.png';
  }

  listPoster(item: any): string {
    return item.poster_path
      ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
      : 'assets/no-image.png';
  }

  activityRoute(entry: WatchedEntry): any[] {
    return ['/' + (entry.media_type === 'tv' ? 'tv' : 'movie'), entry.id];
  }

  listCoverRoute(list: UserList): any[] {
    return ['/list', list.id];
  }

  private monthKey(d: Date): string {
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private formatPercent(value: number, total: number): string {
    if (!total) {
      return '0%';
    }
    return `${Math.round((value / total) * 100)}%`;
  }
}
