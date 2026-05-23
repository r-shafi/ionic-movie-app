import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { TmdbService } from '../services/tmdb.service';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.page.html',
  styleUrls: ['./tv.page.scss'],
})
export class TvPage implements OnInit {
  show: any;
  credits: any;
  videos: any[] = [];
  images: any[] = [];
  // slideshow state
  private _slideshowIndex = 0;
  private _slideshowTimer: any = null;
  private _slideshowInterval = 5000; // ms
  private _currentBackdrop: string | null = null;
  similar: any[] = [];
  recommendations: any[] = [];
  reviews: any[] = [];
  isLoading = true;

  constructor(
    private tmdb: TmdbService,
    private route: ActivatedRoute,
    public profileService: ProfileService,
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    forkJoin({
      show: this.tmdb.getTvDetails(id),
      credits: this.tmdb.getTvCredits(id),
      videos: this.tmdb.getTvVideos(id),
      images: this.tmdb.getTvImages(id),
      similar: this.tmdb.getTvSimilar(id),
      recommendations: this.tmdb.getTvRecommendations(id),
      reviews: this.tmdb.getTvReviews(id),
    }).subscribe({
      next: (data: any) => {
        this.show = data.show;
        this.credits = data.credits;
        this.videos = (data.videos?.results || []).filter(
          (v: any) => v.site === 'YouTube',
        );
        this.images = (data.images?.backdrops || []).slice(0, 20);
        // initialize slideshow backdrop
        if (this.images.length) {
          this._currentBackdrop = this._buildImageUrl(
            this.images[0]?.file_path,
            'w1280',
          );
          this.startBackdropSlideshow();
        }
        this.similar = (data.similar?.results || []).map((i: any) => ({
          ...i,
          media_type: 'tv',
        }));
        this.recommendations = (data.recommendations?.results || []).map(
          (i: any) => ({ ...i, media_type: 'tv' }),
        );
        this.reviews = data.reviews?.results || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  ngOnDestroy() {
    this.stopBackdropSlideshow();
  }

  get backdropUrl(): string {
    if (this._currentBackdrop) return this._currentBackdrop;
    return this.show?.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${this.show.backdrop_path}`
      : '';
  }

  private _buildImageUrl(path: string | undefined, size = 'w1280') {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
  }

  startBackdropSlideshow() {
    this.stopBackdropSlideshow();
    if (!this.images || !this.images.length) return;
    this._slideshowIndex = 0;
    this._slideshowTimer = setInterval(() => {
      this._slideshowIndex = (this._slideshowIndex + 1) % this.images.length;
      this._currentBackdrop = this._buildImageUrl(
        this.images[this._slideshowIndex]?.file_path,
        'w1280',
      );
    }, this._slideshowInterval);
  }

  stopBackdropSlideshow() {
    if (this._slideshowTimer) {
      clearInterval(this._slideshowTimer);
      this._slideshowTimer = null;
    }
  }

  get posterUrl(): string {
    return this.show?.poster_path
      ? `https://image.tmdb.org/t/p/w342${this.show.poster_path}`
      : 'assets/no-image.png';
  }

  get firstAirYear(): string {
    return this.show?.first_air_date?.substring(0, 4) || '';
  }

  get trailerKey(): string | null {
    return (
      this.videos.find((v: any) => v.type === 'Trailer')?.key ||
      this.videos[0]?.key ||
      null
    );
  }

  get cast(): any[] {
    return (this.credits?.cast || []).slice(0, 20);
  }

  get creators(): string {
    return (this.show?.created_by || []).map((c: any) => c.name).join(', ');
  }

  get creatorsWithPhotos(): any[] {
    return this.show?.created_by || [];
  }

  get genres(): string {
    return (this.show?.genres || []).map((g: any) => g.name).join(', ');
  }

  get contentRating(): string {
    const results = this.show?.content_ratings?.results || [];
    const us = results.find((r: any) => r.iso_3166_1 === 'US');
    return us?.rating || '';
  }

  get episodeRuntime(): number | null {
    const rt = this.show?.episode_run_time || [];
    return rt.length > 0 ? rt[0] : null;
  }

  get statusBadgeClass(): string {
    const s = (this.show?.status || '').toLowerCase();
    if (s.includes('returning')) return 'status-returning';
    if (s.includes('ended')) return 'status-ended';
    if (s.includes('cancel')) return 'status-cancelled';
    if (s.includes('planned') || s.includes('production'))
      return 'status-planned';
    return 'status-default';
  }

  openTrailer() {
    if (this.trailerKey) {
      window.open(
        `https://www.youtube.com/watch?v=${this.trailerKey}`,
        '_blank',
      );
    }
  }

  share() {
    const url = `https://www.themoviedb.org/tv/${this.show?.id}`;
    if (navigator.share) {
      navigator.share({
        title: this.show?.name,
        text: this.show?.overview,
        url,
      });
    } else {
      window.open(url, '_blank');
    }
  }

  get userRating(): number | null {
    return this.profileService.getRating('tv', this.show?.id)?.rating || null;
  }

  isWatched(): boolean {
    return this.show
      ? this.profileService.isInWatched({ ...this.show, media_type: 'tv' })
      : false;
  }
  isFavorite(): boolean {
    return this.show
      ? this.profileService.isInFavorites({ ...this.show, media_type: 'tv' })
      : false;
  }
  isWatchlist(): boolean {
    return this.show
      ? this.profileService.isInWatchlist({ ...this.show, media_type: 'tv' })
      : false;
  }

  toggleWatched() {
    if (this.show) {
      this.profileService.toggleWatched({ ...this.show, media_type: 'tv' });
    }
  }
  toggleFavorite() {
    if (this.show) {
      this.profileService.toggleFavorite({ ...this.show, media_type: 'tv' });
    }
  }
  toggleWatchlist() {
    if (this.show) {
      this.profileService.addToWatchlist({ ...this.show, media_type: 'tv' });
    }
  }

  isEpisodeWatched(seasonNum: number, epNum: number): boolean {
    return this.profileService.isEpisodeWatched(
      this.show?.id,
      seasonNum,
      epNum,
    );
  }

  toggleEpisode(seasonNum: number, epNum: number) {
    this.profileService.toggleEpisodeWatched(this.show.id, seasonNum, epNum);
  }

  markSeasonWatched(season: any) {
    const epNums = Array.from(
      { length: season.episode_count },
      (_, i) => i + 1,
    );
    this.profileService.markSeasonWatched(
      this.show.id,
      season.season_number,
      epNums,
    );
  }
}
