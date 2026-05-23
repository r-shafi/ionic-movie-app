import { Component } from '@angular/core';
import { Subject } from 'rxjs';
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
})
export class SearchPage {
  query = '';
  results: any[] = [];
  isLoading = false;
  isOffline = !navigator.onLine;
  recentSearches: string[] = [];

  private readonly STORAGE_KEY = 'recentSearches';
  private searchSubject = new Subject<string>();

  constructor(private tmdb: TmdbService) {
    this.recentSearches = JSON.parse(
      localStorage.getItem(this.STORAGE_KEY) || '[]',
    );
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
      ? `https://image.tmdb.org/t/p/w92${path}`
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
    return `${item.media_type === 'tv' ? 'TV' : 'Movie'}${year ? ' · ' + year : ''}`;
  }
}
