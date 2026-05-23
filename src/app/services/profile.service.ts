import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  runtime?: number;
  episode_run_time?: number[];
  media_type: 'movie' | 'tv';
  date_added?: string;
}

export interface UserRating {
  rating: number;
  date: string;
}

export interface UserReview {
  text: string;
  rating?: number;
  spoilers: boolean;
  date: string;
}

export interface CustomList {
  id: string;
  name: string;
  description: string;
  items: MediaItem[];
  createdAt: string;
}

export interface ActivityEntry {
  type: 'watched' | 'rated' | 'added_to_list' | 'review';
  item: MediaItem;
  rating?: number;
  listName?: string;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  public watchedMovies$ = new BehaviorSubject<MediaItem[]>(
    JSON.parse(localStorage.getItem('watchedMovies') || '[]')
  );
  public watchedTv$ = new BehaviorSubject<MediaItem[]>(
    JSON.parse(localStorage.getItem('watchedTv') || '[]')
  );
  public favoriteMovies$ = new BehaviorSubject<MediaItem[]>(
    JSON.parse(localStorage.getItem('favoriteMovies') || '[]')
  );
  public favoriteTv$ = new BehaviorSubject<MediaItem[]>(
    JSON.parse(localStorage.getItem('favoriteTv') || '[]')
  );
  public watchlist$ = new BehaviorSubject<MediaItem[]>(
    JSON.parse(localStorage.getItem('watchlist') || '[]')
  );
  public ratings$ = new BehaviorSubject<Record<string, UserRating>>(
    JSON.parse(localStorage.getItem('ratings') || '{}')
  );
  public reviews$ = new BehaviorSubject<Record<string, UserReview>>(
    JSON.parse(localStorage.getItem('reviews') || '{}')
  );
  public customLists$ = new BehaviorSubject<CustomList[]>(
    JSON.parse(localStorage.getItem('customLists') || '[]')
  );
  public activity$ = new BehaviorSubject<ActivityEntry[]>(
    JSON.parse(localStorage.getItem('activity') || '[]')
  );

  constructor(private toastService: ToastService) {}

  private toggleItem(
    storageKey: string,
    subject: BehaviorSubject<MediaItem[]>,
    item: any,
    addedMsg: string,
    removedMsg: string
  ): boolean {
    const list: MediaItem[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const idx = list.findIndex(m => m.id === item.id);
    let added = false;
    if (idx > -1) {
      list.splice(idx, 1);
      this.toastService.showToast(removedMsg);
    } else {
      list.push({ ...this.toMinimal(item), date_added: new Date().toISOString() });
      this.toastService.showToast(addedMsg);
      added = true;
    }
    localStorage.setItem(storageKey, JSON.stringify(list));
    subject.next(list);
    return added;
  }

  private toMinimal(item: any): MediaItem {
    return {
      id: item.id,
      title: item.title,
      name: item.name,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      vote_average: item.vote_average,
      runtime: item.runtime,
      episode_run_time: item.episode_run_time,
      media_type: item.media_type || 'movie',
    };
  }

  private addActivity(entry: Omit<ActivityEntry, 'date'>) {
    const list = [
      { ...entry, date: new Date().toISOString() },
      ...this.activity$.getValue(),
    ].slice(0, 100);
    localStorage.setItem('activity', JSON.stringify(list));
    this.activity$.next(list);
  }

  addToWatchedMovies(movie: any) {
    const added = this.toggleItem(
      'watchedMovies', this.watchedMovies$,
      { ...movie, media_type: 'movie' },
      `${movie.title} added to Watched.`,
      `${movie.title} removed from Watched.`
    );
    if (added) {
      this.addActivity({ type: 'watched', item: { ...this.toMinimal(movie), media_type: 'movie' } });
    }
  }

  addToWatchedTv(show: any) {
    const added = this.toggleItem(
      'watchedTv', this.watchedTv$,
      { ...show, media_type: 'tv' },
      `${show.name} added to Watched.`,
      `${show.name} removed from Watched.`
    );
    if (added) {
      this.addActivity({ type: 'watched', item: { ...this.toMinimal(show), media_type: 'tv' } });
    }
  }

  addToFavoriteMovies(movie: any) {
    this.toggleItem(
      'favoriteMovies', this.favoriteMovies$,
      { ...movie, media_type: 'movie' },
      `${movie.title} added to Favorites.`,
      `${movie.title} removed from Favorites.`
    );
  }

  addToFavoriteTv(show: any) {
    this.toggleItem(
      'favoriteTv', this.favoriteTv$,
      { ...show, media_type: 'tv' },
      `${show.name} added to Favorites.`,
      `${show.name} removed from Favorites.`
    );
  }

  addToWatchlist(item: any) {
    const label = item.title || item.name;
    this.toggleItem(
      'watchlist', this.watchlist$,
      item,
      `${label} added to Watchlist.`,
      `${label} removed from Watchlist.`
    );
  }

  toggleWatched(item: any) {
    if (item.media_type === 'tv') { this.addToWatchedTv(item); }
    else { this.addToWatchedMovies(item); }
  }

  toggleFavorite(item: any) {
    if (item.media_type === 'tv') { this.addToFavoriteTv(item); }
    else { this.addToFavoriteMovies(item); }
  }

  isMovieInWatchedMovies(movie: any): boolean {
    return this.watchedMovies$.getValue().some(m => m.id === movie.id);
  }
  isTvInWatched(show: any): boolean {
    return this.watchedTv$.getValue().some(m => m.id === show.id);
  }
  isInWatched(item: any): boolean {
    return item.media_type === 'tv' ? this.isTvInWatched(item) : this.isMovieInWatchedMovies(item);
  }

  isMovieInFavoriteMovies(movie: any): boolean {
    return this.favoriteMovies$.getValue().some(m => m.id === movie.id);
  }
  isTvInFavorites(show: any): boolean {
    return this.favoriteTv$.getValue().some(m => m.id === show.id);
  }
  isInFavorites(item: any): boolean {
    return item.media_type === 'tv' ? this.isTvInFavorites(item) : this.isMovieInFavoriteMovies(item);
  }

  isMovieInWatchlist(movie: any): boolean {
    return this.watchlist$.getValue().some(m => m.id === movie.id);
  }
  isInWatchlist(item: any): boolean {
    return this.watchlist$.getValue().some(m => m.id === item.id);
  }

  saveRating(mediaType: 'movie' | 'tv', id: number, rating: number) {
    const key = `${mediaType}-${id}`;
    const ratings = { ...this.ratings$.getValue(), [key]: { rating, date: new Date().toISOString() } };
    localStorage.setItem('ratings', JSON.stringify(ratings));
    this.ratings$.next(ratings);
  }

  clearRating(mediaType: 'movie' | 'tv', id: number) {
    const key = `${mediaType}-${id}`;
    const ratings = { ...this.ratings$.getValue() };
    delete ratings[key];
    localStorage.setItem('ratings', JSON.stringify(ratings));
    this.ratings$.next(ratings);
  }

  getRating(mediaType: 'movie' | 'tv', id: number): UserRating | null {
    return this.ratings$.getValue()[`${mediaType}-${id}`] || null;
  }

  saveReview(mediaType: 'movie' | 'tv', id: number, review: Omit<UserReview, 'date'>) {
    const key = `${mediaType}-${id}`;
    const reviews = { ...this.reviews$.getValue(), [key]: { ...review, date: new Date().toISOString() } };
    localStorage.setItem('reviews', JSON.stringify(reviews));
    this.reviews$.next(reviews);
  }

  deleteReview(mediaType: 'movie' | 'tv', id: number) {
    const key = `${mediaType}-${id}`;
    const reviews = { ...this.reviews$.getValue() };
    delete reviews[key];
    localStorage.setItem('reviews', JSON.stringify(reviews));
    this.reviews$.next(reviews);
  }

  getReview(mediaType: 'movie' | 'tv', id: number): UserReview | null {
    return this.reviews$.getValue()[`${mediaType}-${id}`] || null;
  }

  toggleEpisodeWatched(tvId: number, season: number, episode: number): boolean {
    const key = `${tvId}-${season}-${episode}`;
    const data: Record<string, boolean> = JSON.parse(localStorage.getItem('watchedEpisodes') || '{}');
    data[key] = !data[key];
    localStorage.setItem('watchedEpisodes', JSON.stringify(data));
    return data[key];
  }

  isEpisodeWatched(tvId: number, season: number, episode: number): boolean {
    const data: Record<string, boolean> = JSON.parse(localStorage.getItem('watchedEpisodes') || '{}');
    return !!data[`${tvId}-${season}-${episode}`];
  }

  markSeasonWatched(tvId: number, season: number, episodes: any[]) {
    const data: Record<string, boolean> = JSON.parse(localStorage.getItem('watchedEpisodes') || '{}');
    episodes.forEach(ep => { data[`${tvId}-${season}-${ep.episode_number}`] = true; });
    localStorage.setItem('watchedEpisodes', JSON.stringify(data));
    this.toastService.showToast('Season marked as watched.');
  }

  createList(name: string, description = ''): CustomList {
    const list: CustomList = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name, description, items: [],
      createdAt: new Date().toISOString(),
    };
    const lists = [...this.customLists$.getValue(), list];
    localStorage.setItem('customLists', JSON.stringify(lists));
    this.customLists$.next(lists);
    this.toastService.showToast(`List "${name}" created.`);
    return list;
  }

  addToList(listId: string, item: any) {
    const lists = this.customLists$.getValue().map(l => {
      if (l.id !== listId) { return l; }
      if (l.items.find(i => i.id === item.id)) {
        this.toastService.showToast('Already in this list.');
        return l;
      }
      this.toastService.showToast(`Added to "${l.name}".`);
      return { ...l, items: [...l.items, this.toMinimal(item)] };
    });
    localStorage.setItem('customLists', JSON.stringify(lists));
    this.customLists$.next(lists);
  }

  removeFromList(listId: string, itemId: number) {
    const lists = this.customLists$.getValue().map(l =>
      l.id === listId ? { ...l, items: l.items.filter(i => i.id !== itemId) } : l
    );
    localStorage.setItem('customLists', JSON.stringify(lists));
    this.customLists$.next(lists);
  }

  deleteList(listId: string) {
    const lists = this.customLists$.getValue().filter(l => l.id !== listId);
    localStorage.setItem('customLists', JSON.stringify(lists));
    this.customLists$.next(lists);
    this.toastService.showToast('List deleted.');
  }

  reorderList(listId: string, items: MediaItem[]) {
    const lists = this.customLists$.getValue().map(l =>
      l.id === listId ? { ...l, items } : l
    );
    localStorage.setItem('customLists', JSON.stringify(lists));
    this.customLists$.next(lists);
  }

  getList(listId: string): CustomList | undefined {
    return this.customLists$.getValue().find(l => l.id === listId);
  }

  getTotalHoursWatched(): number {
    const movies = this.watchedMovies$.getValue().reduce((s, m) => s + (m.runtime || 0), 0);
    const tv = this.watchedTv$.getValue().reduce((s, sh) => s + (sh.episode_run_time?.[0] || 45), 0);
    return Math.round((movies + tv) / 60);
  }

  getRatingDistribution(): Record<number, number> {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    Object.values(this.ratings$.getValue()).forEach(r => {
      const star = Math.round(r.rating);
      if (star >= 1 && star <= 5) { dist[star]++; }
    });
    return dist;
  }

  clearAllData() {
    ['watchedMovies','watchedTv','favoriteMovies','favoriteTv','watchlist',
     'ratings','reviews','watchedEpisodes','customLists','activity']
      .forEach(k => localStorage.removeItem(k));
    this.watchedMovies$.next([]); this.watchedTv$.next([]);
    this.favoriteMovies$.next([]); this.favoriteTv$.next([]);
    this.watchlist$.next([]); this.ratings$.next({});
    this.reviews$.next({}); this.customLists$.next([]);
    this.activity$.next([]);
    this.toastService.showToast('All data cleared.');
  }
}
