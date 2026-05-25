import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { UserDataService, FavoriteEntry, WatchedEntry, UserList } from '../services/user-data.service';
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

  constructor(
    public userData: UserDataService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
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
    return this.watchedEntries.slice(0, (this.activityPage + 1) * this.pageSize);
  }

  get hasMoreActivity(): boolean {
    return this.visibleActivity.length < this.watchedEntries.length;
  }

  get allLists(): UserList[] {
    return this.userData.getLists();
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
  }

  async createList() {
    const alert = await this.alertCtrl.create({
      header: 'New List',
      inputs: [
        { name: 'name', type: 'text', placeholder: 'List name' },
        { name: 'description', type: 'text', placeholder: 'Description (optional)' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Create',
          handler: (data) => {
            if (data.name?.trim()) {
              this.userData.createList(data.name.trim(), data.description?.trim() || '');
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
        { text: 'Delete', role: 'destructive', handler: () => this.userData.deleteList(id) },
      ],
    });
    await alert.present();
  }

  statCards() {
    const s = this.stats;
    return [
      { label: 'Total Watched', value: s.totalWatched },
      { label: 'Total Hours', value: s.totalHoursEstimated },
      { label: 'Avg Rating', value: s.averageRating !== null ? s.averageRating.toFixed(1) : '-' },
      { label: 'Total Liked', value: s.likedCount },
    ];
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
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = parseInt(iso.split('-')[1], 10);
    return months[m - 1] || iso;
  }

  getMonthLabel(iso: string): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const m = parseInt(iso.split('-')[1], 10);
    return months[m - 1] || iso;
  }

  entryRating(entry: WatchedEntry): string {
    if (entry.rating === null) { return ''; }
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
}
