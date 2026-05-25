import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs';
import { ModalController } from '@ionic/angular';
import { TmdbService } from '../../services/tmdb.service';
import { UserDataService } from '../../services/user-data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-favorite-modal',
  templateUrl: './add-favorite-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AddFavoriteModalComponent implements OnInit, OnDestroy {
  query = '';
  results: any[] = [];
  isLoading = false;
  private searchSubj = new Subject<string>();
  private sub = Subscription.EMPTY;

  constructor(
    private modalCtrl: ModalController,
    private tmdb: TmdbService,
    private userData: UserDataService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.sub = this.searchSubj.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      filter((q) => q.trim().length >= 2),
      switchMap((q) => {
        this.isLoading = true;
        return this.tmdb.searchMulti(q);
      }),
    ).subscribe({
      next: (res: any) => {
        this.results = (res?.results || []).filter(
          (r: any) => r.media_type === 'movie' || r.media_type === 'tv',
        );
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onSearch(value: string) {
    this.query = value;
    if (!value?.trim()) {
      this.results = [];
      return;
    }
    this.searchSubj.next(value.trim());
  }

  addFavorite(item: any) {
    const entry = {
      id: item.id,
      media_type: item.media_type as 'movie' | 'tv',
      title: item.title || item.name,
      poster_path: item.poster_path,
    };
    this.userData.addFavorite(entry);
    this.toast.showToast(`Added "${entry.title}" to favourites`);
    this.modalCtrl.dismiss();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  posterUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w92${path}` : 'assets/no-image.png';
  }
}
