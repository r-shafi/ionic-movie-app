import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { TmdbService } from '../services/tmdb.service';

@Component({
  selector: 'app-film',
  templateUrl: './film.page.html',
  styleUrls: ['./film.page.scss'],
})
export class FilmPage implements OnInit {
  movie: any;
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
      movie: this.tmdb.getMovie(id),
      credits: this.tmdb.getMovieCredits(id),
      videos: this.tmdb.getMovieVideos(id),
      images: this.tmdb.getMovieImages(id),
      similar: this.tmdb.getMovieSimilar(id),
      recommendations: this.tmdb.getMovieRecommendations(id),
      reviews: this.tmdb.getMovieReviews(id),
    }).subscribe({
      next: (data: any) => {
        this.movie = data.movie;
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
          media_type: 'movie',
        }));
        this.recommendations = (data.recommendations?.results || []).map(
          (i: any) => ({ ...i, media_type: 'movie' }),
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
    return this.movie?.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${this.movie.backdrop_path}`
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
    return this.movie?.poster_path
      ? `https://image.tmdb.org/t/p/w342${this.movie.poster_path}`
      : 'assets/no-image.png';
  }

  get year(): string {
    return this.movie?.release_date?.substring(0, 4) || '';
  }

  get trailerKey(): string | null {
    return (
      this.videos.find((v: any) => v.type === 'Trailer')?.key ||
      this.videos[0]?.key ||
      null
    );
  }

  get cast(): any[] {
    return (this.credits?.cast || []).slice(0, 30);
  }

  get director(): string {
    return (
      (this.credits?.crew || [])
        .filter((c: any) => c.job === 'Director')
        .map((c: any) => c.name)
        .join(', ') || ''
    );
  }

  get genres(): string {
    return (this.movie?.genres || []).map((g: any) => g.name).join(', ');
  }

  get userRating(): number | null {
    return (
      this.profileService.getRating('movie', this.movie?.id)?.rating || null
    );
  }

  isWatched(): boolean {
    return this.movie
      ? this.profileService.isInWatched({ ...this.movie, media_type: 'movie' })
      : false;
  }
  isFavorite(): boolean {
    return this.movie
      ? this.profileService.isInFavorites({
          ...this.movie,
          media_type: 'movie',
        })
      : false;
  }
  isWatchlist(): boolean {
    return this.movie
      ? this.profileService.isInWatchlist({
          ...this.movie,
          media_type: 'movie',
        })
      : false;
  }

  toggleWatched() {
    if (this.movie) {
      this.profileService.toggleWatched({ ...this.movie, media_type: 'movie' });
    }
  }
  toggleFavorite() {
    if (this.movie) {
      this.profileService.toggleFavorite({
        ...this.movie,
        media_type: 'movie',
      });
    }
  }
  toggleWatchlist() {
    if (this.movie) {
      this.profileService.addToWatchlist({
        ...this.movie,
        media_type: 'movie',
      });
    }
  }
}
