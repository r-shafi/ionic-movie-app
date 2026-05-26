/*
Audit Notes (Phase 0)
- profile.service.ts persists localStorage keys: watchedMovies, watchedTv, favoriteMovies, favoriteTv, watchlist,
  ratings, reviews, customLists, activity, watchedEpisodes. MediaItem stores id, title/name, poster_path,
  backdrop_path, release_date/first_air_date, vote_average, runtime/episode_run_time, media_type, date_added.
- movie-card inputs: @Input() movie uses poster_path, media_type, title/name, release_date/first_air_date,
  vote_average; calls ProfileService add/toggle for watched, favorite, watchlist.
- poster-card inputs: @Input() item, @Input() mediaType; uses poster_path/backdrop_path, title/name,
  release_date/first_air_date, vote_average; reads rating via ProfileService.getRating().
- film/tv detail pages call ProfileService getRating/isInWatched/isInFavorites/isInWatchlist and toggles;
  tv detail and tv-season use episode watched helpers.
- profile page consumes watchedMovies$, watchedTv$, favoriteMovies$, favoriteTv$, watchlist$, ratings$,
  customLists$, activity$; displayName from SettingsService.
- settings.service.ts stores appSettings with theme, language, region, includeAdult, displayName, excludeLanguages.
*/

import { Injectable } from '@angular/core';
import { ToastService } from './toast.service';

export interface UserProfile {
  displayName: string;
  bio: string;
  avatarBase64: string | null;
  coverBase64: string | null;
  joinedAt: string;
}

export interface WatchedEntry {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  watchedAt: string;
  rewatch: boolean;
  rating: number | null;
  review: string;
  tags: string[];
  liked: boolean;
  release_date?: string;
  first_air_date?: string;
}

export interface WatchlistEntry {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  addedAt: string;
  release_date?: string;
  first_air_date?: string;
}

export interface FavoriteEntry {
  id: number;
  media_type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
}

export interface UserList {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  items: WatchlistEntry[];
}

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  language: string;
  region: string;
  includeAdult: boolean;
  displayName: string;
  excludeLanguages: string[];
  fadeWatched: boolean;
  defaultMediaTab: 'movies' | 'tv';
  primaryColor: 'green' | 'red';
}

type SettingsRecord = AppSettings & {
  episodeWatched?: Record<string, boolean>;
};

interface LegacyUserRating {
  rating: number;
  date: string;
}

interface LegacyUserReview {
  text: string;
  rating?: number;
  spoilers: boolean;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private readonly PROFILE_KEY = 'mva_profile';
  private readonly WATCHED_KEY = 'mva_watched';
  private readonly WATCHLIST_KEY = 'mva_watchlist';
  private readonly FAVORITES_KEY = 'mva_favorites';
  private readonly LISTS_KEY = 'mva_lists';
  private readonly SETTINGS_KEY = 'mva_settings';

  constructor(private toast: ToastService) {
    this.migrateFromLegacy();
  }

  // Profile

  getProfile(): UserProfile {
    const stored = this.readJson<UserProfile | null>(this.PROFILE_KEY, null);
    if (!stored) {
      const fresh = this.buildDefaultProfile();
      this.writeJson(this.PROFILE_KEY, fresh);
      return fresh;
    }
    const joinedAt = stored.joinedAt || new Date().toISOString();
    const merged: UserProfile = {
      displayName: stored.displayName || 'Movie Fan',
      bio: stored.bio || '',
      avatarBase64: stored.avatarBase64 ?? null,
      coverBase64: stored.coverBase64 ?? null,
      joinedAt,
    };
    if (joinedAt !== stored.joinedAt) {
      this.writeJson(this.PROFILE_KEY, merged);
    }
    return merged;
  }

  saveProfile(patch: Partial<UserProfile>): void {
    const current = this.getProfile();
    const updated: UserProfile = {
      ...current,
      ...patch,
      joinedAt: current.joinedAt || patch.joinedAt || new Date().toISOString(),
    };
    this.writeJson(this.PROFILE_KEY, updated);
  }

  // Watched

  getWatched(): Record<string, WatchedEntry> {
    return this.readJson<Record<string, WatchedEntry>>(this.WATCHED_KEY, {});
  }

  getWatchedEntry(mediaType: string, id: number): WatchedEntry | null {
    const key = `${mediaType}:${id}`;
    const watched = this.getWatched();
    return watched[key] || null;
  }

  logEntry(
    entry: Omit<WatchedEntry, 'watchedAt'> & { watchedAt?: string },
  ): void {
    const watched = this.getWatched();
    const key = `${entry.media_type}:${entry.id}`;
    const existing = watched[key];
    const watchedAt =
      entry.watchedAt || existing?.watchedAt || new Date().toISOString();
    const rating = this.normalizeRating(
      entry.rating ?? existing?.rating ?? null,
    );
    watched[key] = {
      id: entry.id,
      media_type: entry.media_type,
      title: entry.title,
      poster_path: entry.poster_path ?? null,
      watchedAt,
      rewatch: entry.rewatch ?? existing?.rewatch ?? false,
      rating,
      review: entry.review ?? existing?.review ?? '',
      tags: entry.tags ?? existing?.tags ?? [],
      liked: entry.liked ?? existing?.liked ?? false,
      release_date: entry.release_date ?? existing?.release_date,
      first_air_date: entry.first_air_date ?? existing?.first_air_date,
    };
    this.writeJson(this.WATCHED_KEY, watched);
  }

  removeWatched(mediaType: string, id: number): void {
    const watched = this.getWatched();
    const key = `${mediaType}:${id}`;
    if (watched[key]) {
      delete watched[key];
      this.writeJson(this.WATCHED_KEY, watched);
    }
  }

  isWatched(mediaType: string, id: number): boolean {
    return !!this.getWatchedEntry(mediaType, id);
  }

  // Watchlist

  getWatchlist(): WatchlistEntry[] {
    const record = this.readJson<Record<string, WatchlistEntry>>(
      this.WATCHLIST_KEY,
      {},
    );
    return Object.values(record).sort((a, b) =>
      b.addedAt.localeCompare(a.addedAt),
    );
  }

  addToWatchlist(item: Omit<WatchlistEntry, 'addedAt'>): void {
    const record = this.readJson<Record<string, WatchlistEntry>>(
      this.WATCHLIST_KEY,
      {},
    );
    const key = `${item.media_type}:${item.id}`;
    if (!record[key]) {
      record[key] = { ...item, addedAt: new Date().toISOString() };
      this.writeJson(this.WATCHLIST_KEY, record);
    }
  }

  removeFromWatchlist(mediaType: string, id: number): void {
    const record = this.readJson<Record<string, WatchlistEntry>>(
      this.WATCHLIST_KEY,
      {},
    );
    const key = `${mediaType}:${id}`;
    if (record[key]) {
      delete record[key];
      this.writeJson(this.WATCHLIST_KEY, record);
    }
  }

  isOnWatchlist(mediaType: string, id: number): boolean {
    const record = this.readJson<Record<string, WatchlistEntry>>(
      this.WATCHLIST_KEY,
      {},
    );
    return !!record[`${mediaType}:${id}`];
  }

  // Favorites

  getFavorites(): FavoriteEntry[] {
    const list = this.readJson<FavoriteEntry[]>(this.FAVORITES_KEY, []);
    return list.slice(0, 4);
  }

  addFavorite(item: FavoriteEntry): void {
    const list = this.readJson<FavoriteEntry[]>(this.FAVORITES_KEY, []);
    if (
      list.some((f) => f.id === item.id && f.media_type === item.media_type)
    ) {
      return;
    }
    if (list.length >= 4) {
      this.toast.showToast('Favorites are limited to 4 items.');
      return;
    }
    list.push(item);
    this.writeJson(this.FAVORITES_KEY, list);
  }

  removeFavorite(mediaType: string, id: number): void {
    const list = this.readJson<FavoriteEntry[]>(this.FAVORITES_KEY, []);
    const next = list.filter(
      (f) => !(f.id === id && f.media_type === mediaType),
    );
    this.writeJson(this.FAVORITES_KEY, next);
  }

  reorderFavorites(ordered: FavoriteEntry[]): void {
    const seen = new Set<string>();
    const next: FavoriteEntry[] = [];
    ordered.forEach((item) => {
      const key = `${item.media_type}:${item.id}`;
      if (!seen.has(key) && next.length < 4) {
        seen.add(key);
        next.push(item);
      }
    });
    this.writeJson(this.FAVORITES_KEY, next);
  }

  // Lists

  getLists(): UserList[] {
    const record = this.readJson<Record<string, UserList>>(this.LISTS_KEY, {});
    return Object.values(record).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  getList(id: string): UserList | null {
    const record = this.readJson<Record<string, UserList>>(this.LISTS_KEY, {});
    return record[id] || null;
  }

  createList(name: string, description = ''): UserList {
    const record = this.readJson<Record<string, UserList>>(this.LISTS_KEY, {});
    const list: UserList = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
      items: [],
    };
    record[list.id] = list;
    this.writeJson(this.LISTS_KEY, record);
    return list;
  }

  deleteList(id: string): void {
    const record = this.readJson<Record<string, UserList>>(this.LISTS_KEY, {});
    if (record[id]) {
      delete record[id];
      this.writeJson(this.LISTS_KEY, record);
    }
  }

  addToList(listId: string, item: Omit<WatchlistEntry, 'addedAt'>): void {
    const record = this.readJson<Record<string, UserList>>(this.LISTS_KEY, {});
    const list = record[listId];
    if (!list) {
      return;
    }
    const exists = list.items.some(
      (i) => i.id === item.id && i.media_type === item.media_type,
    );
    if (exists) {
      return;
    }
    const nextItem: WatchlistEntry = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    record[listId] = { ...list, items: [...list.items, nextItem] };
    this.writeJson(this.LISTS_KEY, record);
  }

  removeFromList(listId: string, mediaType: string, id: number): void {
    const record = this.readJson<Record<string, UserList>>(this.LISTS_KEY, {});
    const list = record[listId];
    if (!list) {
      return;
    }
    record[listId] = {
      ...list,
      items: list.items.filter(
        (item) => !(item.id === id && item.media_type === mediaType),
      ),
    };
    this.writeJson(this.LISTS_KEY, record);
  }

  // Settings

  getSettings(): AppSettings {
    const settings = this.getSettingsRecord();
    return this.stripSettings(settings);
  }

  saveSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): void {
    const settings = this.getSettingsRecord();
    const updated: SettingsRecord = { ...settings, [key]: value };
    this.writeJson(this.SETTINGS_KEY, updated);
  }

  // ── Bookmarked Lists ─────────────────────────────────────────────────────

  private readonly BOOKMARKED_LISTS_KEY = 'mva_bookmarked_lists';
  private readonly RECENT_LISTS_KEY = 'mva_recent_lists';

  bookmarkList(list: any): void {
    const bookmarks = this.readJson<any[]>(this.BOOKMARKED_LISTS_KEY, []);
    if (!bookmarks.some(b => b.id === list.id)) {
      const coverItems = (list.items || [])
        .filter((i: any) => i.poster_path)
        .slice(0, 4)
        .map((i: any) => ({ id: i.id, poster_path: i.poster_path, media_type: i.media_type }));
      bookmarks.unshift({
        id: list.id,
        name: list.name,
        description: list.description || '',
        item_count: list.item_count || 0,
        favorite_count: list.favorite_count || 0,
        poster_path: list.poster_path || null,
        creator_username: list.created_by?.username || list.creator_username || '',
        items: coverItems,
      });
      this.writeJson(this.BOOKMARKED_LISTS_KEY, bookmarks);
    }
  }

  unbookmarkList(listId: number): void {
    const bookmarks = this.readJson<any[]>(this.BOOKMARKED_LISTS_KEY, []);
    const next = bookmarks.filter(b => b.id !== listId);
    this.writeJson(this.BOOKMARKED_LISTS_KEY, next);
  }

  isListBookmarked(listId: number): boolean {
    const bookmarks = this.readJson<any[]>(this.BOOKMARKED_LISTS_KEY, []);
    return bookmarks.some(b => b.id === listId);
  }

  getBookmarkedLists(): any[] {
    return this.readJson<any[]>(this.BOOKMARKED_LISTS_KEY, []);
  }

  recordListView(list: any): void {
    let recent = this.readJson<any[]>(this.RECENT_LISTS_KEY, []);
    recent = recent.filter(r => r.id !== list.id);
    const coverItems = (list.items || [])
      .filter((i: any) => i.poster_path)
      .slice(0, 4)
      .map((i: any) => ({ id: i.id, poster_path: i.poster_path, media_type: i.media_type }));
    recent.unshift({
      id: list.id,
      name: list.name,
      description: list.description || '',
      item_count: list.item_count || 0,
      favorite_count: list.favorite_count || 0,
      poster_path: list.poster_path || null,
      creator_username: list.created_by?.username || list.creator_username || '',
      items: coverItems,
    });
    if (recent.length > 10) {
      recent = recent.slice(0, 10);
    }
    this.writeJson(this.RECENT_LISTS_KEY, recent);
  }

  getRecentlyViewedLists(): any[] {
    return this.readJson<any[]>(this.RECENT_LISTS_KEY, []);
  }

  // Analytics

  getStats(): {
    totalWatched: number;
    totalMovies: number;
    totalTv: number;
    totalHoursEstimated: number;
    averageRating: number | null;
    ratingsDistribution: Record<string, number>;
    watchedByMonth: { month: string; count: number }[];
    topGenres: { name: string; count: number }[];
    likedCount: number;
  } {
    const watched = Object.values(this.getWatched());
    const totalWatched = watched.length;
    const totalMovies = watched.filter((e) => e.media_type === 'movie').length;
    const totalTv = watched.filter((e) => e.media_type === 'tv').length;
    const totalHoursEstimated = Number((totalWatched * 1.8).toFixed(1));

    const rated = watched.filter((e) => typeof e.rating === 'number');
    const averageRating = rated.length
      ? Number(
          (
            rated.reduce((sum, e) => sum + (e.rating || 0), 0) / rated.length
          ).toFixed(2),
        )
      : null;

    const ratingsDistribution: Record<string, number> = {};
    for (let i = 0.5; i <= 5; i += 0.5) {
      ratingsDistribution[i.toFixed(1)] = 0;
    }
    watched.forEach((entry) => {
      if (typeof entry.rating === 'number') {
        const key = entry.rating.toFixed(1);
        if (ratingsDistribution[key] !== undefined) {
          ratingsDistribution[key] += 1;
        }
      }
    });

    const watchedByMonth = this.buildWatchedByMonth(watched);

    const tagCounts: Record<string, number> = {};
    watched.forEach((entry) => {
      (entry.tags || []).forEach((tag) => {
        if (!tag) {
          return;
        }
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const topGenres = Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const likedCount = watched.filter((e) => e.liked).length;

    return {
      totalWatched,
      totalMovies,
      totalTv,
      totalHoursEstimated,
      averageRating,
      ratingsDistribution,
      watchedByMonth,
      topGenres,
      likedCount,
    };
  }

  // Episode helpers (stored inside settings record)

  isEpisodeWatched(tvId: number, season: number, episode: number): boolean {
    const settings = this.getSettingsRecord();
    const map = settings.episodeWatched || {};
    return !!map[`${tvId}-${season}-${episode}`];
  }

  toggleEpisodeWatched(tvId: number, season: number, episode: number): boolean {
    const settings = this.getSettingsRecord();
    const map = { ...(settings.episodeWatched || {}) };
    const key = `${tvId}-${season}-${episode}`;
    map[key] = !map[key];
    const updated: SettingsRecord = { ...settings, episodeWatched: map };
    this.writeJson(this.SETTINGS_KEY, updated);
    return map[key];
  }

  markSeasonWatched(tvId: number, season: number, episodes: number[]): void {
    const settings = this.getSettingsRecord();
    const map = { ...(settings.episodeWatched || {}) };
    episodes.forEach((ep) => {
      map[`${tvId}-${season}-${ep}`] = true;
    });
    const updated: SettingsRecord = { ...settings, episodeWatched: map };
    this.writeJson(this.SETTINGS_KEY, updated);
  }

  private buildDefaultProfile(): UserProfile {
    return {
      displayName: 'Movie Fan',
      bio: '',
      avatarBase64: null,
      coverBase64: null,
      joinedAt: new Date().toISOString(),
    };
  }

  private buildDefaultSettings(): SettingsRecord {
    return {
      theme: 'system',
      language: 'en-US',
      region: 'US',
      includeAdult: false,
      displayName: 'Movie Fan',
      excludeLanguages: [],
      fadeWatched: false,
      defaultMediaTab: 'movies',
      primaryColor: 'green',
    };
  }

  private getSettingsRecord(): SettingsRecord {
    const stored = this.readJson<SettingsRecord | null>(
      this.SETTINGS_KEY,
      null,
    );
    if (!stored) {
      const fresh = this.buildDefaultSettings();
      this.writeJson(this.SETTINGS_KEY, fresh);
      return fresh;
    }
    const merged = { ...this.buildDefaultSettings(), ...stored };
    if (!stored.displayName && stored.displayName !== '') {
      merged.displayName = 'Movie Fan';
    }
    return merged;
  }

  private stripSettings(settings: SettingsRecord): AppSettings {
    const { episodeWatched: _episodeWatched, ...clean } = settings;
    return clean;
  }

  private buildWatchedByMonth(
    watched: WatchedEntry[],
  ): { month: string; count: number }[] {
    const result: { month: string; count: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = this.monthKey(d);
      result.push({ month: key, count: 0 });
    }
    const monthMap = new Map(result.map((m) => [m.month, m]));
    watched.forEach((entry) => {
      const d = new Date(entry.watchedAt);
      if (Number.isNaN(d.getTime())) {
        return;
      }
      const key = this.monthKey(d);
      const target = monthMap.get(key);
      if (target) {
        target.count += 1;
      }
    });
    return result;
  }

  private monthKey(d: Date): string {
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private normalizeRating(value: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    const rounded = Math.round(value * 2) / 2;
    if (rounded < 0.5) {
      return 0.5;
    }
    if (rounded > 5) {
      return 5;
    }
    return rounded;
  }

  private readJson<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  private writeJson<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private migrateFromLegacy(): void {
    const hasMvaData =
      localStorage.getItem(this.PROFILE_KEY) ||
      localStorage.getItem(this.WATCHED_KEY) ||
      localStorage.getItem(this.WATCHLIST_KEY) ||
      localStorage.getItem(this.FAVORITES_KEY) ||
      localStorage.getItem(this.LISTS_KEY) ||
      localStorage.getItem(this.SETTINGS_KEY);
    if (hasMvaData) {
      return;
    }

    const watchedMovies = this.readJson<any[]>('watchedMovies', []);
    const watchedTv = this.readJson<any[]>('watchedTv', []);
    const favoriteMovies = this.readJson<any[]>('favoriteMovies', []);
    const favoriteTv = this.readJson<any[]>('favoriteTv', []);
    const watchlist = this.readJson<any[]>('watchlist', []);
    const ratings = this.readJson<Record<string, LegacyUserRating>>(
      'ratings',
      {},
    );
    const reviews = this.readJson<Record<string, LegacyUserReview>>(
      'reviews',
      {},
    );
    const customLists = this.readJson<any[]>('customLists', []);
    const legacySettings = this.readJson<any>('appSettings', null);
    const watchedEpisodes = this.readJson<Record<string, boolean>>(
      'watchedEpisodes',
      {},
    );

    const favoriteSet = new Set<string>([
      ...favoriteMovies.map((m) => `movie:${m.id}`),
      ...favoriteTv.map((t) => `tv:${t.id}`),
    ]);

    const itemIndex = new Map<string, any>();
    [
      ...watchedMovies,
      ...watchedTv,
      ...watchlist,
      ...favoriteMovies,
      ...favoriteTv,
    ].forEach((item) => {
      const mt = item.media_type || (item.first_air_date ? 'tv' : 'movie');
      itemIndex.set(`${mt}:${item.id}`, item);
    });

    const watched: Record<string, WatchedEntry> = {};
    const applyEntry = (item: any, mediaType: 'movie' | 'tv') => {
      if (!item) {
        return;
      }
      const key = `${mediaType}:${item.id}`;
      const ratingKey = `${mediaType}-${item.id}`;
      const legacyRating = ratings[ratingKey];
      const legacyReview = reviews[ratingKey];
      const watchedAt =
        item.date_added ||
        legacyReview?.date ||
        legacyRating?.date ||
        new Date().toISOString();
      const rating = legacyRating?.rating ?? legacyReview?.rating ?? null;
      watched[key] = {
        id: item.id,
        media_type: mediaType,
        title: item.title || item.name || '',
        poster_path: item.poster_path || null,
        watchedAt,
        rewatch: false,
        rating: this.normalizeRating(rating),
        review: legacyReview?.text || '',
        tags: [],
        liked: favoriteSet.has(key),
        release_date: item.release_date,
        first_air_date: item.first_air_date,
      };
    };

    watchedMovies.forEach((m) => applyEntry(m, 'movie'));
    watchedTv.forEach((t) => applyEntry(t, 'tv'));

    Object.keys(ratings).forEach((key) => {
      const [mediaType, idStr] = key.split('-');
      if (!mediaType || !idStr) {
        return;
      }
      const lookupKey = `${mediaType}:${idStr}`;
      if (watched[lookupKey]) {
        return;
      }
      const item = itemIndex.get(lookupKey);
      if (!item) {
        return;
      }
      applyEntry(item, mediaType as 'movie' | 'tv');
    });

    const watchlistRecord: Record<string, WatchlistEntry> = {};
    watchlist.forEach((item) => {
      const mediaType = (item.media_type ||
        (item.first_air_date ? 'tv' : 'movie')) as 'movie' | 'tv';
      const key = `${mediaType}:${item.id}`;
      watchlistRecord[key] = {
        id: item.id,
        media_type: mediaType,
        title: item.title || item.name || '',
        poster_path: item.poster_path || null,
        addedAt: item.date_added || new Date().toISOString(),
        release_date: item.release_date,
        first_air_date: item.first_air_date,
      };
    });

    const favorites: FavoriteEntry[] = [
      ...favoriteMovies.map((m) => ({
        id: m.id,
        media_type: 'movie' as const,
        title: m.title || m.name || '',
        poster_path: m.poster_path || null,
      })),
      ...favoriteTv.map((t) => ({
        id: t.id,
        media_type: 'tv' as const,
        title: t.title || t.name || '',
        poster_path: t.poster_path || null,
      })),
    ].slice(0, 4);

    const listsRecord: Record<string, UserList> = {};
    customLists.forEach((list) => {
      const listId = list.id || crypto.randomUUID();
      const items: WatchlistEntry[] = (list.items || []).map((item: any) => {
        const mediaType = (item.media_type ||
          (item.first_air_date ? 'tv' : 'movie')) as 'movie' | 'tv';
        return {
          id: item.id,
          media_type: mediaType,
          title: item.title || item.name || '',
          poster_path: item.poster_path || null,
          addedAt:
            item.date_added || list.createdAt || new Date().toISOString(),
          release_date: item.release_date,
          first_air_date: item.first_air_date,
        };
      });
      listsRecord[listId] = {
        id: listId,
        name: list.name || 'Untitled List',
        description: list.description || '',
        createdAt: list.createdAt || new Date().toISOString(),
        items,
      };
    });

    const settings: SettingsRecord = {
      ...this.buildDefaultSettings(),
      ...(legacySettings || {}),
      fadeWatched: false,
      defaultMediaTab:
        (legacySettings?.defaultMediaTab as 'movies' | 'tv') || 'movies',
      episodeWatched: Object.keys(watchedEpisodes).length
        ? watchedEpisodes
        : undefined,
    };

    const profile: UserProfile = {
      displayName: settings.displayName || 'Movie Fan',
      bio: '',
      avatarBase64: null,
      coverBase64: null,
      joinedAt: new Date().toISOString(),
    };

    this.writeJson(this.PROFILE_KEY, profile);
    this.writeJson(this.WATCHED_KEY, watched);
    this.writeJson(this.WATCHLIST_KEY, watchlistRecord);
    this.writeJson(this.FAVORITES_KEY, favorites);
    this.writeJson(this.LISTS_KEY, listsRecord);
    this.writeJson(this.SETTINGS_KEY, settings);

    [
      'watchedMovies',
      'watchedTv',
      'favoriteMovies',
      'favoriteTv',
      'watchlist',
      'ratings',
      'reviews',
      'customLists',
      'activity',
      'watchedEpisodes',
      'appSettings',
    ].forEach((key) => localStorage.removeItem(key));
  }
}
