import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-poster-card',
    templateUrl: './poster-card.component.html',
    styleUrls: ['./poster-card.component.scss'],
    standalone: false
})
export class PosterCardComponent {
  @Input() item: any;
  @Input() mediaType: 'movie' | 'tv' = 'movie';

  constructor(
    private router: Router,
    private profileService: ProfileService,
  ) {}

  get posterUrl(): string {
    const p = this.item?.poster_path;
    return p ? `https://image.tmdb.org/t/p/w185${p}` : 'assets/no-image.png';
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
    return this.profileService.getRating(mt, this.item.id)?.rating || null;
  }

  navigate() {
    const mt = this.item?.media_type || this.mediaType;
    this.router.navigate([mt === 'tv' ? '/tv' : '/movie', this.item.id]);
  }
}
