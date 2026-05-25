import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LogSheetService } from 'src/app/shared-module/log-sheet/log-sheet.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-movie-card',
    templateUrl: './movie-card.component.html',
    standalone: false
})
export class MovieCardComponent implements OnInit, OnDestroy {
  @Input() movie: any;

  isWatched: boolean;
  isFavorite: boolean;
  isWatchlist: boolean;
  longPressThreshold = 500;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressClick = false;

  constructor(
    public profileService: ProfileService,
    private router: Router,
    private logSheet: LogSheetService,
  ) {}

  addToWatchedMovies() {
    this.profileService.addToWatchedMovies(this.movie);
    this.isWatched = !this.isWatched;
  }

  addToFavoriteMovies() {
    this.profileService.addToFavoriteMovies(this.movie);
    this.isFavorite = !this.isFavorite;
  }

  addToWatchlist() {
    this.profileService.addToWatchlist(this.movie);
    this.isWatchlist = !this.isWatchlist;
  }

  onTouchStart() {
    this.suppressClick = false;
    this.longPressTimer = setTimeout(() => {
      this.suppressClick = true;
      this.triggerLongPress();
    }, this.longPressThreshold);
  }

  onTouchEnd() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  handleNavigate(event: Event) {
    if (this.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      this.suppressClick = false;
      return;
    }
    this.navigate();
  }

  navigate() {
    if (!this.movie) {
      return;
    }
    const mt = this.movie.media_type || (this.movie.first_air_date ? 'tv' : 'movie');
    this.router.navigate([mt === 'tv' ? '/tv' : '/movie', this.movie.id]);
  }

  ngOnInit() {
    this.isWatched = this.profileService.isMovieInWatchedMovies(this.movie);
    this.isFavorite = this.profileService.isMovieInFavoriteMovies(this.movie);
    this.isWatchlist = this.profileService.isMovieInWatchlist(this.movie);
  }

  ngOnDestroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private async triggerLongPress() {
    if (!this.movie) {
      return;
    }
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Ignore haptics errors on unsupported platforms.
    }
    const mediaType = this.movie.media_type || (this.movie.first_air_date ? 'tv' : 'movie');
    await this.logSheet.open({
      id: this.movie.id,
      media_type: mediaType,
      title: this.movie.title || this.movie.name || '',
      poster_path: this.movie.poster_path || null,
      release_date: this.movie.release_date,
      first_air_date: this.movie.first_air_date,
    });
  }
}
