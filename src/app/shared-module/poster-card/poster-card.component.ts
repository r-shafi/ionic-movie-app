import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LogSheetService } from 'src/app/shared-module/log-sheet/log-sheet.service';
import { UserDataService } from 'src/app/services/user-data.service';

@Component({
  selector: 'app-poster-card',
  templateUrl: './poster-card.component.html',
  styleUrls: ['./poster-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class PosterCardComponent implements OnChanges, OnDestroy {
  @Input() item: any;
  @Input() mediaType: 'movie' | 'tv' = 'movie';
  @Input() showFadeIfWatched = true;
  @Input() fadeRefresh = 0;
  shouldFade = false;
  longPressThreshold = 500;
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressClick = false;

  constructor(
    private router: Router,
    private logSheet: LogSheetService,
    private userData: UserDataService,
  ) {}

  get posterUrl(): string {
    const p = this.item?.poster_path || this.item?.backdrop_path;
    return p ? `https://image.tmdb.org/t/p/w342${p}` : 'assets/no-image.png';
  }

  get title(): string {
    return this.item?.title || this.item?.name || '';
  }

  get year(): string {
    const d = this.item?.release_date || this.item?.first_air_date || '';
    return d ? d.substring(0, 4) : '';
  }

  get userRating(): number | null {
    if (!this.item) {
      return null;
    }
    const mt = (this.item.media_type || this.mediaType) as 'movie' | 'tv';
    return this.userData.getWatchedEntry(mt, this.item.id)?.rating || null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.item || changes.showFadeIfWatched || changes.fadeRefresh) {
      this.updateFadeState();
    }
  }

  handleClick(event: Event) {
    if (this.suppressClick) {
      event.preventDefault();
      event.stopPropagation();
      this.suppressClick = false;
      return;
    }
    this.navigate();
  }

  navigate() {
    const mt = this.item?.media_type || this.mediaType;
    this.router.navigate([mt === 'tv' ? '/tv' : '/movie', this.item.id]);
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

  ngOnDestroy() {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  private async triggerLongPress() {
    if (!this.item) {
      return;
    }
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      // Ignore haptics errors on unsupported platforms.
    }
    const mediaType = (this.item.media_type || this.mediaType) as 'movie' | 'tv';
    await this.logSheet.open({
      id: this.item.id,
      media_type: mediaType,
      title: this.item.title || this.item.name || '',
      poster_path: this.item.poster_path || null,
      release_date: this.item.release_date,
      first_air_date: this.item.first_air_date,
    });
  }

  private updateFadeState() {
    if (!this.item || !this.showFadeIfWatched) {
      this.shouldFade = false;
      return;
    }
    const settings = this.userData.getSettings();
    const mediaType = (this.item.media_type || this.mediaType) as 'movie' | 'tv';
    this.shouldFade =
      settings.fadeWatched && this.userData.isWatched(mediaType, this.item.id);
  }
}
