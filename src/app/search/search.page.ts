import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
} from 'rxjs/operators';
import { TmdbService } from '../services/tmdb.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.page.html',
    styleUrls: ['./search.page.scss'],
    standalone: false
})
export class SearchPage implements OnInit {
  query = '';
  results: any[] = [];
  isLoading = false;
  isOffline = !navigator.onLine;
  recentSearches: string[] = [];

  popularItems: any[] = [];
  genres: any[] = [];
  trendingSearches: any[] = [];
  trendingPeople: any[] = [];
  isLoadingDiscover = true;

  private readonly STORAGE_KEY = 'recentSearches';
  private searchSubject = new Subject<string>();

  readonly genreColors: Record<number, string> = {
    28: 'linear-gradient(135deg, #ff6b6b, #ee0979)',
    12: 'linear-gradient(135deg, #74b9ff, #0984e3)',
    16: 'linear-gradient(135deg, #fdcb6e, #e17055)',
    35: 'linear-gradient(135deg, #fd79a8, #e84393)',
    80: 'linear-gradient(135deg, #636e72, #2d3436)',
    99: 'linear-gradient(135deg, #00b894, #00cec9)',
    18: 'linear-gradient(135deg, #a29bfe, #6c5ce7)',
    10751: 'linear-gradient(135deg, #55efc4, #00b894)',
    14: 'linear-gradient(135deg, #b2bec3, #74b9ff)',
    36: 'linear-gradient(135deg, #ffeaa7, #fdcb6e)',
    27: 'linear-gradient(135deg, #2c3e50, #1a1a2e)',
    10402: 'linear-gradient(135deg, #fd79a8, #fdcb6e)',
    9648: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    10749: 'linear-gradient(135deg, #fd79a8, #e84393)',
    878: 'linear-gradient(135deg, #4776e6, #8e54e9)',
    10770: 'linear-gradient(135deg, #00cec9, #74b9ff)',
    53: 'linear-gradient(135deg, #2d3436, #636e72)',
    10752: 'linear-gradient(135deg, #b2bec3, #636e72)',
    37: 'linear-gradient(135deg, #fdcb6e, #e17055)',
    10759: 'linear-gradient(135deg, #ff6b6b, #ee0979)',
    10762: 'linear-gradient(135deg, #55efc4, #00b894)',
    10763: 'linear-gradient(135deg, #74b9ff, #0984e3)',
    10764: 'linear-gradient(135deg, #fdcb6e, #e17055)',
    10765: 'linear-gradient(135deg, #4776e6, #8e54e9)',
    10766: 'linear-gradient(135deg, #fd79a8, #e84393)',
    10767: 'linear-gradient(135deg, #00b894, #00cec9)',
    10768: 'linear-gradient(135deg, #b2bec3, #636e72)',
  };

  readonly genreIcons: Record<number, string> = {
    28: 'flame-outline',
    12: 'compass-outline',
    16: 'happy-outline',
    35: 'happy-outline',
    80: 'skull-outline',
    99: 'film-outline',
    18: 'heart-outline',
    10751: 'home-outline',
    14: 'sparkles-outline',
    36: 'book-outline',
    27: 'eye-off-outline',
    10402: 'musical-notes-outline',
    9648: 'help-circle-outline',
    10749: 'rose-outline',
    878: 'planet-outline',
    10770: 'tv-outline',
    53: 'alert-circle-outline',
    10752: 'shield-outline',
    37: 'sunny-outline',
    10759: 'flame-outline',
    10762: 'happy-outline',
    10763: 'newspaper-outline',
    10764: 'people-outline',
    10765: 'planet-outline',
    10766: 'heart-outline',
    10767: 'chatbubble-outline',
    10768: 'shield-outline',
  };

  constructor(
    private tmdb: TmdbService,
    private router: Router,
  ) {
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        filter((q) => q.trim().length >= 2),
        switchMap((q) => {
          this.isLoading = true;
          return this.tmdb.searchMulti(q);
        }),
      )
      .subscribe({
        next: (res: any) => {
          this.results = (res?.results || []).filter(
            (r: any) => r.media_type !== 'person' || r.known_for,
          );
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  ngOnInit() {
    this.recentSearches = JSON.parse(
      localStorage.getItem(this.STORAGE_KEY) || '[]',
    );
    if (!this.isOffline) {
      this.loadDiscoverSections();
    }
  }

  loadDiscoverSections() {
    forkJoin({
      movieGenres: this.tmdb.getMovieGenres(),
      tvGenres: this.tmdb.getTvGenres(),
      trendingAll: this.tmdb.getTrendingAll('day'),
      trendingPeople: this.tmdb.getTrendingPeople(1, 'week'),
    }).subscribe({
      next: (data: any) => {
        const genreMap = new Map<number, any>();
        [
          ...(data.movieGenres.genres || []),
          ...(data.tvGenres.genres || []),
        ].forEach((g: any) => genreMap.set(g.id, g));
        this.genres = Array.from(genreMap.values()).slice(0, 6);

        const all = data.trendingAll.results || [];
        const mediaItems = all.filter(
          (item: any) =>
            item.media_type === 'movie' || item.media_type === 'tv',
        );
        this.popularItems = mediaItems.slice(0, 10);
        this.trendingSearches = mediaItems.slice(0, 5);
        this.trendingPeople = (data.trendingPeople.results || []).slice(0, 10);
        this.isLoadingDiscover = false;
      },
      error: () => {
        this.isLoadingDiscover = false;
      },
    });
  }

  onSearch(value: string) {
    this.query = value;
    if (!value?.trim()) {
      this.results = [];
      return;
    }
    this.searchSubject.next(value.trim());
  }

  onSearchSubmit() {
    if (this.query.trim().length >= 2) {
      this.saveRecent(this.query.trim());
    }
  }

  searchRecent(term: string) {
    this.query = term;
    this.onSearch(term);
  }

  removeRecent(term: string, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.recentSearches = this.recentSearches.filter((t) => t !== term);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recentSearches));
  }

  clearRecent() {
    this.recentSearches = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveRecent(term: string) {
    this.recentSearches = [
      term,
      ...this.recentSearches.filter((t) => t !== term),
    ].slice(0, 10);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recentSearches));
  }

  getRoute(item: any): any[] {
    if (item.media_type === 'tv') {
      return ['/tv', item.id];
    }
    if (item.media_type === 'person') {
      return ['/person', item.id];
    }
    return ['/movie', item.id];
  }

  getPoster(item: any): string {
    const path = item.poster_path || item.profile_path;
    return path
      ? `https://image.tmdb.org/t/p/w185${path}`
      : 'assets/no-image.png';
  }

  getTitle(item: any): string {
    return item.title || item.name || '';
  }

  getSubtitle(item: any): string {
    if (item.media_type === 'person') {
      return item.known_for_department || 'Person';
    }
    const year = (item.release_date || item.first_air_date || '').substring(
      0,
      4,
    );
    const label = item.media_type === 'tv' ? 'TV Show' : 'Movie';
    return `${label}${year ? ' · ' + year : ''}`;
  }

  getRating(item: any): string {
    return item.vote_average ? item.vote_average.toFixed(1) : '';
  }

  browseGenre(genreId: number) {
    this.router.navigate(['/tabs/discover'], {
      queryParams: { mode: 'browse', genre: genreId, tab: 'movies' },
    });
  }

  seeAllPopular() {
    this.router.navigate(['/tabs/discover']);
  }

  seeAllPeople() {
    this.router.navigate(['/tabs/discover']);
  }

  getGenreColor(genreId: number): string {
    return (
      this.genreColors[genreId] || 'linear-gradient(135deg, #74b9ff, #0984e3)'
    );
  }

  getGenreIcon(genreId: number): string {
    return this.genreIcons[genreId] || 'grid-outline';
  }
}
