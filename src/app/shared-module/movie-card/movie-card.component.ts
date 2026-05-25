import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LogSheetService } from 'src/app/shared-module/log-sheet/log-sheet.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-movie-card',
  templateUrl: './movie-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MovieCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input() movie: any;
  @Input() showFadeIfWatched = true;
  @Input() fadeRefresh = 0;

  isWatched: boolean;
  isFavorite: boolean;
  isWatchlist: boolean;
  shouldFade = false;
  longPressThreshold = 500;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressClick = false;

  constructor(
    private router: Router,
    private logSheet: LogSheetService,
    private userData: UserDataService,
  ) {}

  private getMediaType(): 'movie' | 'tv' {
    return (this.movie?.media_type ||
      (this.movie?.first_air_date ? 'tv' : 'movie')) as 'movie' | 'tv';
  }

  addToWatchedMovies() {
    const mt = this.getMediaType();
    if (this.isWatched) {
      this.userData.removeWatched(mt, this.movie.id);
      this.isWatched = false;
    } else {
      this.userData.logEntry({
        id: this.movie.id,
        media_type: mt,
        title: this.movie.title || this.movie.name || '',
        poster_path: this.movie.poster_path || null,
        rewatch: false,
        rating: null,
        review: '',
        tags: [],
        liked: false,
        release_date: this.movie.release_date,
        first_air_date: this.movie.first_air_date,
      });
      this.isWatched = true;
    }
  }

  addToFavoriteMovies() {
    const mt = this.getMediaType();
    if (this.isFavorite) {
      this.userData.removeFavorite(mt, this.movie.id);
      this.isFavorite = false;
    } else {
      this.userData.addFavorite({
        id: this.movie.id,
        media_type: mt,
        title: this.movie.title || this.movie.name || '',
        poster_path: this.movie.poster_path || null,
      });
      this.isFavorite = true;
    }
  }

  addToWatchlist() {
    const mt = this.getMediaType();
    if (this.isWatchlist) {
      this.userData.removeFromWatchlist(mt, this.movie.id);
      this.isWatchlist = false;
    } else {
      this.userData.addToWatchlist({
        id: this.movie.id,
        media_type: mt,
        title: this.movie.title || this.movie.name || '',
        poster_path: this.movie.poster_path || null,
        release_date: this.movie.release_date,
        first_air_date: this.movie.first_air_date,
      });
      this.isWatchlist = true;
    }
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
    const mt = this.getMediaType();
    this.router.navigate([mt === 'tv' ? '/tv' : '/movie', this.movie.id]);
  }

  ngOnInit() {
    this.refreshFromService();
    this.updateFadeState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.movie && this.movie) {
      this.refreshFromService();
    }
    if (changes.movie || changes.showFadeIfWatched || changes.fadeRefresh) {
      this.updateFadeState();
    }
  }

  ngOnDestroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private refreshFromService() {
    if (!this.movie) {
      return;
    }
    const mt = this.getMediaType();
    this.isWatched = this.userData.isWatched(mt, this.movie.id);
    this.isFavorite = this.userData
      .getFavorites()
      .some((f) => f.id === this.movie.id && f.media_type === mt);
    this.isWatchlist = this.userData.isOnWatchlist(mt, this.movie.id);
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
    const mt = this.getMediaType();
    await this.logSheet.open({
      id: this.movie.id,
      media_type: mt,
      title: this.movie.title || this.movie.name || '',
      poster_path: this.movie.poster_path || null,
      release_date: this.movie.release_date,
      first_air_date: this.movie.first_air_date,
    });
  }

  private updateFadeState() {
    if (!this.movie || !this.showFadeIfWatched) {
      this.shouldFade = false;
      return;
    }
    const settings = this.userData.getSettings();
    const mt = this.getMediaType();
    this.shouldFade =
      settings.fadeWatched && this.userData.isWatched(mt, this.movie.id);
  }
}
