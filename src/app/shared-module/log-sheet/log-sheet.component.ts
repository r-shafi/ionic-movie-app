import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import {
  UserDataService,
  UserList,
  WatchedEntry,
  WatchlistEntry,
} from 'src/app/services/user-data.service';
import { ToastService } from 'src/app/services/toast.service';

export interface LogSheetItem {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  release_date?: string;
  first_air_date?: string;
}

@Component({
  selector: 'app-log-sheet',
  templateUrl: './log-sheet.component.html',
  styleUrls: ['./log-sheet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class LogSheetComponent implements OnInit {
  @Input() item!: LogSheetItem;

  existing: WatchedEntry | null = null;
  hasWatched = false;
  rating: number | null = null;
  liked = false;
  rewatch = false;
  review = '';
  tags: string[] = [];
  tagInput = '';
  watchedAt = new Date().toISOString();
  watchlistEnabled = false;
  lists: UserList[] = [];
  selectedListIds: string[] = [];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private userData: UserDataService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (!this.item) {
      return;
    }
    this.existing = this.userData.getWatchedEntry(
      this.item.media_type,
      this.item.id,
    );
    this.hasWatched = !!this.existing;
    this.watchlistEnabled = this.userData.isOnWatchlist(
      this.item.media_type,
      this.item.id,
    );
    this.lists = this.userData.getLists();
    this.selectedListIds = this.lists
      .filter((list) =>
        list.items.some(
          (entry) =>
            entry.id === this.item.id &&
            entry.media_type === this.item.media_type,
        ),
      )
      .map((list) => list.id);

    if (this.existing) {
      this.rating = this.existing.rating;
      this.liked = this.existing.liked;
      this.rewatch = this.existing.rewatch;
      this.review = this.existing.review || '';
      this.tags = [...(this.existing.tags || [])];
      this.watchedAt = this.existing.watchedAt;
    }
  }

  get posterUrl(): string {
    return this.item?.poster_path
      ? `https://image.tmdb.org/t/p/w185${this.item.poster_path}`
      : 'assets/no-image.png';
  }

  get yearLabel(): string {
    const date = this.item?.release_date || this.item?.first_air_date || '';
    return date ? date.substring(0, 4) : '';
  }

  get selectedListLabel(): string {
    if (!this.selectedListIds.length) {
      return 'None';
    }
    const names = this.lists
      .filter((list) => this.selectedListIds.includes(list.id))
      .map((list) => list.name);
    return names.join(', ');
  }

  addTag(): void {
    const raw = this.tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length);
    raw.forEach((tag) => {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    });
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
  }

  updateWatchedDate(value: string | string[] | null): void {
    if (!value) {
      return;
    }
    this.watchedAt = Array.isArray(value) ? value[0] : value;
  }

  async openListPicker(): Promise<void> {
    if (!this.lists.length) {
      this.toast.showToast('No lists yet. Create one in your profile.');
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Add to lists',
      inputs: this.lists.map((list) => ({
        type: 'checkbox',
        label: list.name,
        value: list.id,
        checked: this.selectedListIds.includes(list.id),
      })),
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Done',
          handler: (selected: string[]) => {
            this.selectedListIds = selected || [];
          },
        },
      ],
    });
    await alert.present();
  }

  async save(): Promise<void> {
    if (!this.item) {
      return;
    }

    const watchlistItem = this.buildWatchlistItem();

    if (this.hasWatched) {
      this.userData.logEntry({
        id: this.item.id,
        media_type: this.item.media_type,
        title: this.item.title,
        poster_path: this.item.poster_path,
        watchedAt: this.watchedAt,
        rewatch: this.rewatch,
        rating: this.rating,
        review: this.review || '',
        tags: this.tags,
        liked: this.liked,
        release_date: this.item.release_date,
        first_air_date: this.item.first_air_date,
      });
    } else if (this.existing) {
      this.userData.removeWatched(this.item.media_type, this.item.id);
    }

    if (this.watchlistEnabled) {
      this.userData.addToWatchlist(watchlistItem);
    } else {
      this.userData.removeFromWatchlist(this.item.media_type, this.item.id);
    }

    this.selectedListIds.forEach((listId) => {
      this.userData.addToList(listId, watchlistItem);
    });

    await this.modalCtrl.dismiss();
    this.toast.showToast(this.hasWatched ? 'Log saved.' : 'Saved to watchlist.');
  }

  async removeLog(): Promise<void> {
    if (!this.existing) {
      return;
    }
    const alert = await this.alertCtrl.create({
      header: 'Remove log?',
      message: 'This will remove the watched entry.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Remove',
          role: 'destructive',
          handler: async () => {
            this.userData.removeWatched(this.item.media_type, this.item.id);
            await this.modalCtrl.dismiss();
            this.toast.showToast('Log removed.');
          },
        },
      ],
    });
    await alert.present();
  }

  cancel(): void {
    this.modalCtrl.dismiss();
  }

  private buildWatchlistItem(): Omit<WatchlistEntry, 'addedAt'> {
    return {
      id: this.item.id,
      media_type: this.item.media_type,
      title: this.item.title,
      poster_path: this.item.poster_path,
      release_date: this.item.release_date,
      first_air_date: this.item.first_air_date,
    };
  }
}
