import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SettingsService } from './settings.service';

export interface DiscoverParams {
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  first_air_date_year?: number;
  'primary_release_date.gte'?: string;
  'primary_release_date.lte'?: string;
  'vote_average.gte'?: number;
  'vote_average.lte'?: number;
  with_original_language?: string;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly base = environment.tmdbBaseUrl;
  private readonly key = environment.tmdbApiKey;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
  ) {}

  // ── helpers ────────────────────────────────────────────────────────────────

  private params(extra: Record<string, any> = {}): HttpParams {
    const s = this.settings.settings;
    let p = new HttpParams()
      .set('api_key', this.key)
      .set('language', s.language)
      .set('include_adult', String(s.includeAdult));
    Object.entries(extra).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        p = p.set(k, String(v));
      }
    });
    return p;
  }

  private get<T>(path: string, extra: Record<string, any> = {}): Observable<T> {
    return this.http.get<T>(`${this.base}${path}`, {
      params: this.params(extra),
    });
  }

  // ── Trending ───────────────────────────────────────────────────────────────

  getTrendingAll(
    timeWindow: 'day' | 'week' = 'day',
    page = 1,
  ): Observable<any> {
    return this.get(`/trending/all/${timeWindow}`, { page });
  }

  getTrendingMovies(
    page = 1,
    timeWindow: 'day' | 'week' = 'day',
  ): Observable<any> {
    return this.get(`/trending/movie/${timeWindow}`, { page });
  }

  getTrendingTv(page = 1, timeWindow: 'day' | 'week' = 'day'): Observable<any> {
    return this.get(`/trending/tv/${timeWindow}`, { page });
  }

  getTrendingPeople(page = 1, timeWindow: 'day' | 'week' = 'day'): Observable<any> {
    return this.get(`/trending/person/${timeWindow}`, { page });
  }

  // ── Movies ─────────────────────────────────────────────────────────────────

  getPopularMovies(page = 1): Observable<any> {
    return this.get('/movie/popular', {
      page,
      region: this.settings.settings.region,
    });
  }

  getTopRatedMovies(page = 1): Observable<any> {
    return this.get('/movie/top_rated', {
      page,
      region: this.settings.settings.region,
    });
  }

  getNowPlayingMovies(page = 1): Observable<any> {
    return this.get('/movie/now_playing', {
      page,
      region: this.settings.settings.region,
    });
  }

  getUpcomingMovies(page = 1): Observable<any> {
    return this.get('/movie/upcoming', {
      page,
      region: this.settings.settings.region,
    });
  }

  getMovie(id: number | string): Observable<any> {
    return this.get(`/movie/${id}`, { append_to_response: 'release_dates' });
  }

  getMovieCredits(id: number | string): Observable<any> {
    return this.get(`/movie/${id}/credits`);
  }

  getMovieVideos(id: number | string): Observable<any> {
    return this.get(`/movie/${id}/videos`);
  }

  getMovieImages(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.base}/movie/${id}/images`, {
      params: new HttpParams().set('api_key', this.key),
    });
  }

  getMovieSimilar(id: number | string, page = 1): Observable<any> {
    return this.get(`/movie/${id}/similar`, { page });
  }

  getMovieRecommendations(id: number | string, page = 1): Observable<any> {
    return this.get(`/movie/${id}/recommendations`, { page });
  }

  getMovieReviews(id: number | string, page = 1): Observable<any> {
    return this.get(`/movie/${id}/reviews`, { page });
  }

  getMovieCollection(collectionId: number | string): Observable<any> {
    return this.get(`/collection/${collectionId}`);
  }

  getMovieKeywords(id: number | string): Observable<any> {
    return this.get(`/movie/${id}/keywords`);
  }

  discoverMovies(extra: DiscoverParams = {}): Observable<any> {
    return this.get('/discover/movie', { ...extra });
  }

  getMovieGenres(): Observable<any> {
    return this.get('/genre/movie/list');
  }

  // ── TV ─────────────────────────────────────────────────────────────────────

  getPopularTv(page = 1): Observable<any> {
    return this.get('/tv/popular', { page });
  }

  getTopRatedTv(page = 1): Observable<any> {
    return this.get('/tv/top_rated', { page });
  }

  getAiringTodayTv(page = 1): Observable<any> {
    return this.get('/tv/airing_today', { page });
  }

  getOnAirTv(page = 1): Observable<any> {
    return this.get('/tv/on_the_air', { page });
  }

  getTvDetails(id: number | string): Observable<any> {
    return this.get(`/tv/${id}`, { append_to_response: 'content_ratings' });
  }

  getTvCredits(id: number | string): Observable<any> {
    return this.get(`/tv/${id}/credits`);
  }

  getTvVideos(id: number | string): Observable<any> {
    return this.get(`/tv/${id}/videos`);
  }

  getTvImages(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.base}/tv/${id}/images`, {
      params: new HttpParams().set('api_key', this.key),
    });
  }

  getTvSimilar(id: number | string, page = 1): Observable<any> {
    return this.get(`/tv/${id}/similar`, { page });
  }

  getTvRecommendations(id: number | string, page = 1): Observable<any> {
    return this.get(`/tv/${id}/recommendations`, { page });
  }

  getTvReviews(id: number | string, page = 1): Observable<any> {
    return this.get(`/tv/${id}/reviews`, { page });
  }

  getTvSeason(
    tvId: number | string,
    seasonNumber: number | string,
  ): Observable<any> {
    return this.get(`/tv/${tvId}/season/${seasonNumber}`);
  }

  discoverTv(extra: DiscoverParams = {}): Observable<any> {
    return this.get('/discover/tv', { ...extra });
  }

  getTvGenres(): Observable<any> {
    return this.get('/genre/tv/list');
  }

  // ── People ─────────────────────────────────────────────────────────────────

  getPersonDetails(id: number | string): Observable<any> {
    return this.get(`/person/${id}`, {
      append_to_response: 'combined_credits,external_ids',
    });
  }

  getPersonCredits(id: number | string): Observable<any> {
    return this.get(`/person/${id}/combined_credits`);
  }

  getPersonImages(id: number | string): Observable<any> {
    return this.http.get<any>(`${this.base}/person/${id}/images`, {
      params: new HttpParams().set('api_key', this.key),
    });
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  searchMulti(query: string, page = 1): Observable<any> {
    return this.get('/search/multi', { query, page });
  }

  searchMovies(query: string, page = 1): Observable<any> {
    return this.get('/search/movie', { query, page });
  }

  searchTv(query: string, page = 1): Observable<any> {
    return this.get('/search/tv', { query, page });
  }

  searchPeople(query: string, page = 1): Observable<any> {
    return this.get('/search/person', { query, page });
  }
}
