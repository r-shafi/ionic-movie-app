import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { TmdbService } from '../services/tmdb.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.page.html',
    standalone: false
})
export class HomePage implements OnInit {
  trendingMovies: any[] = [];
  trendingTv: any[] = [];
  popularMovies: any[] = [];
  topRatedMovies: any[] = [];
  nowPlaying: any[] = [];
  upcoming: any[] = [];
  popularTv: any[] = [];
  topRatedTv: any[] = [];
  airingTv: any[] = [];

  heroItems: any[] = [];
  isLoading = true;
  isOffline = !navigator.onLine;

  constructor(private tmdb: TmdbService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData(event?: any) {
    this.isLoading = true;
    forkJoin({
      trendingAll: this.tmdb.getTrendingAll('day', 1),
      trendingMovies: this.tmdb.getTrendingMovies(1),
      trendingTv: this.tmdb.getTrendingTv(1),
      popularMovies: this.tmdb.getPopularMovies(1),
      topRatedMovies: this.tmdb.getTopRatedMovies(1),
      nowPlaying: this.tmdb.getNowPlayingMovies(1),
      upcoming: this.tmdb.getUpcomingMovies(1),
      popularTv: this.tmdb.getPopularTv(1),
      topRatedTv: this.tmdb.getTopRatedTv(1),
      airingTv: this.tmdb.getAiringTodayTv(1),
    }).subscribe({
      next: (data: any) => {
        this.heroItems = (data.trendingAll?.results || [])
          .slice(0, 5)
          .map((i: any) => ({
            ...i,
            media_type: i.media_type || 'movie',
          }));
        this.trendingMovies = (data.trendingMovies?.results || []).map(
          (i: any) => ({ ...i, media_type: 'movie' }),
        );
        this.trendingTv = (data.trendingTv?.results || []).map((i: any) => ({
          ...i,
          media_type: 'tv',
        }));
        this.popularMovies = (data.popularMovies?.results || []).map(
          (i: any) => ({ ...i, media_type: 'movie' }),
        );
        this.topRatedMovies = (data.topRatedMovies?.results || []).map(
          (i: any) => ({ ...i, media_type: 'movie' }),
        );
        this.nowPlaying = (data.nowPlaying?.results || []).map((i: any) => ({
          ...i,
          media_type: 'movie',
        }));
        this.upcoming = (data.upcoming?.results || []).map((i: any) => ({
          ...i,
          media_type: 'movie',
        }));
        this.popularTv = (data.popularTv?.results || []).map((i: any) => ({
          ...i,
          media_type: 'tv',
        }));
        this.topRatedTv = (data.topRatedTv?.results || []).map((i: any) => ({
          ...i,
          media_type: 'tv',
        }));
        this.airingTv = (data.airingTv?.results || []).map((i: any) => ({
          ...i,
          media_type: 'tv',
        }));
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        if (event) {
          event.target.complete();
        }
      },
    });
  }

  doRefresh(event: any) {
    this.loadData(event);
  }
}
