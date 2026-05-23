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

  get backdropUrl(): string {
    return this.show?.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${this.show.backdrop_path}`
      : '';
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

  get genres(): string {
    return (this.show?.genres || []).map((g: any) => g.name).join(', ');
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
