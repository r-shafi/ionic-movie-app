import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService, WatchlistEntry } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
  standalone: false,
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() isLoading = false;

  currentIndex = 0;
  private timer: any;

  constructor(
    private userData: UserDataService,
    private router: Router,
  ) {}

  get current(): any {
    return this.items?.[this.currentIndex] || null;
  }

  get backdropUrl(): string {
    const p = this.current?.backdrop_path;
    return p ? `https://image.tmdb.org/t/p/w1280${p}` : '';
  }

  getYear(item: any): string {
    const d = item?.release_date || item?.first_air_date || '';
    return d ? d.substring(0, 4) : '';
  }

  ngOnInit() {
    this.startCycle();
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private startCycle() {
    this.timer = setInterval(() => {
      if (this.items?.length > 1) {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
      }
    }, 5000);
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  navigate() {
    if (!this.current) {
      return;
    }
    const route =
      this.current.media_type === 'tv'
        ? ['/tv', this.current.id]
        : ['/movie', this.current.id];
    this.router.navigate(route);
  }

  private getMediaType(): 'movie' | 'tv' {
    return (this.current?.media_type ||
      (this.current?.first_air_date ? 'tv' : 'movie')) as 'movie' | 'tv';
  }

  isWatched(): boolean {
    return this.current
      ? this.userData.isWatched(this.getMediaType(), this.current.id)
      : false;
  }
  isFavorite(): boolean {
    return this.userData
      .getFavorites()
      .some(
        (f) =>
          f.id === this.current?.id && f.media_type === this.getMediaType(),
      );
  }
  isWatchlist(): boolean {
    return this.current
      ? this.userData.isOnWatchlist(this.getMediaType(), this.current.id)
      : false;
  }

  toggleWatched(event: Event) {
    event.stopPropagation();
    if (!this.current) {
      return;
    }
    const mt = this.getMediaType();
    const label = this.current.title || this.current.name || '';
    if (this.isWatched()) {
      this.userData.removeWatched(mt, this.current.id);
    } else {
      this.userData.logEntry({
        id: this.current.id,
        media_type: mt,
        title: label,
        poster_path: this.current.poster_path || null,
        rewatch: false,
        rating: null,
        review: '',
        tags: [],
        liked: false,
        release_date: this.current.release_date,
        first_air_date: this.current.first_air_date,
      });
    }
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (!this.current) {
      return;
    }
    const mt = this.getMediaType();
    if (this.isFavorite()) {
      this.userData.removeFavorite(mt, this.current.id);
    } else {
      this.userData.addFavorite({
        id: this.current.id,
        media_type: mt,
        title: this.current.title || this.current.name || '',
        poster_path: this.current.poster_path || null,
      });
    }
  }

  toggleWatchlist(event: Event) {
    event.stopPropagation();
    if (!this.current) {
      return;
    }
    const mt = this.getMediaType();
    if (this.isWatchlist()) {
      this.userData.removeFromWatchlist(mt, this.current.id);
    } else {
      const item: Omit<WatchlistEntry, 'addedAt'> = {
        id: this.current.id,
        media_type: mt,
        title: this.current.title || this.current.name || '',
        poster_path: this.current.poster_path || null,
        release_date: this.current.release_date,
        first_air_date: this.current.first_air_date,
      };
      this.userData.addToWatchlist(item);
    }
  }
}
