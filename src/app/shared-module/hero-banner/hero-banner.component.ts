import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-hero-banner',
  templateUrl: './hero-banner.component.html',
  styleUrls: ['./hero-banner.component.scss'],
})
export class HeroBannerComponent implements OnInit, OnDestroy {
  @Input() items: any[] = [];
  @Input() isLoading = false;

  currentIndex = 0;
  private timer: any;

  constructor(
    private profileService: ProfileService,
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

  isWatched(): boolean {
    return this.current ? this.profileService.isInWatched(this.current) : false;
  }
  isFavorite(): boolean {
    return this.current
      ? this.profileService.isInFavorites(this.current)
      : false;
  }
  isWatchlist(): boolean {
    return this.current
      ? this.profileService.isInWatchlist(this.current)
      : false;
  }

  toggleWatched(event: Event) {
    event.stopPropagation();
    if (this.current) {
      this.profileService.toggleWatched(this.current);
    }
  }
  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (this.current) {
      this.profileService.toggleFavorite(this.current);
    }
  }
  toggleWatchlist(event: Event) {
    event.stopPropagation();
    if (this.current) {
      this.profileService.addToWatchlist(this.current);
    }
  }
}
