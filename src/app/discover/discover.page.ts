import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SettingsService } from '../services/settings.service';
import { DiscoverParams, TmdbService } from '../services/tmdb.service';

@Component({
    selector: 'app-discover',
    templateUrl: './discover.page.html',
    styleUrls: ['./discover.page.scss'],
    standalone: false
})
export class DiscoverPage implements OnInit {
  viewMode: 'explore' | 'browse' | 'list' = 'explore';
  listTitle = '';

  // Explore data
  trendWindow: 'day' | 'week' = 'week';
  trendingMovies: any[] = [];
  trendingTv: any[] = [];
  topRatedMovies: any[] = [];
  topRatedTv: any[] = [];
  nowPlaying: any[] = [];
  upcoming: any[] = [];
  airingToday: any[] = [];
  popularTv: any[] = [];
  isLoadingExplore = true;

  // Browse state
  activeTab: 'movies' | 'tv' = 'movies';
  selectedGenre: number | null = null;
  sortBy = 'popularity.desc';
  selectedYear: number | null = null;
  browseResults: any[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoadingBrowse = false;
  hasMore = false;

  // Genres
  movieGenres: any[] = [];
  tvGenres: any[] = [];

  readonly currentYear = new Date().getFullYear();
  readonly years: number[] = Array.from(
    { length: 40 },
    (_, i) => new Date().getFullYear() - i,
  );

  readonly sortOptions = [
    { label: 'Popular', value: 'popularity.desc' },
    { label: 'Top Rated', value: 'vote_average.desc' },
    { label: 'Newest', value: 'primary_release_date.desc' },
    { label: 'Revenue', value: 'revenue.desc' },
  ];

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
    // TV genres
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
    private settingsService: SettingsService,
    private route: ActivatedRoute,
    private location: Location,
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['mode'] === 'list') {
        this.viewMode = 'list';
        this.listTitle = params['title'] || 'Results';
        this.activeTab = (params['tab'] as 'movies' | 'tv') || 'movies';
        this.sortBy = params['sort'] || 'popularity.desc';
        this.selectedGenre = null;
        this.selectedYear = null;
        this.currentPage = 1;
        this.browseResults = [];
        this.loadBrowse();
      } else if (params['mode'] === 'browse') {
        this.viewMode = 'browse';
        this.activeTab = (params['tab'] as 'movies' | 'tv') || 'movies';
        this.sortBy = params['sort'] || 'popularity.desc';
        this.selectedGenre = null;
        this.selectedYear = null;
        this.currentPage = 1;
        this.browseResults = [];
        this.loadBrowse();
      }
    });

    forkJoin({
      movieGenres: this.tmdb.getMovieGenres(),
      tvGenres: this.tmdb.getTvGenres(),
      trendingMovies: this.tmdb.getTrendingMovies(1, 'week'),
      trendingTv: this.tmdb.getTrendingTv(1, 'week'),
      topRatedMovies: this.tmdb.getTopRatedMovies(),
      topRatedTv: this.tmdb.getTopRatedTv(),
      nowPlaying: this.tmdb.getNowPlayingMovies(),
      upcoming: this.tmdb.getUpcomingMovies(),
      airingToday: this.tmdb.getAiringTodayTv(),
      popularTv: this.tmdb.getPopularTv(),
    }).subscribe({
      next: (data: any) => {
        this.movieGenres = data.movieGenres.genres;
        this.tvGenres = data.tvGenres.genres;
        this.trendingMovies = data.trendingMovies.results;
        this.trendingTv = data.trendingTv.results;
        this.topRatedMovies = data.topRatedMovies.results;
        this.topRatedTv = data.topRatedTv.results;
        this.nowPlaying = data.nowPlaying.results;
        this.upcoming = data.upcoming.results;
        this.airingToday = data.airingToday.results;
        this.popularTv = data.popularTv.results;
        this.isLoadingExplore = false;
      },
      error: () => {
        this.isLoadingExplore = false;
      },
    });
  }

  setTrendWindow(window: 'day' | 'week') {
    if (this.trendWindow === window) {
      return;
    }
    this.trendWindow = window;
    forkJoin({
      movies: this.tmdb.getTrendingMovies(1, window),
      tv: this.tmdb.getTrendingTv(1, window),
    }).subscribe((data: any) => {
      this.trendingMovies = data.movies.results;
      this.trendingTv = data.tv.results;
    });
  }

  exitList() {
    this.location.back();
  }

  enterBrowse() {
    this.viewMode = 'browse';
    if (!this.browseResults.length) {
      this.loadBrowse();
    }
  }

  browseGenre(genreId: number, tab: 'movies' | 'tv' = 'movies') {
    this.viewMode = 'browse';
    this.activeTab = tab;
    this.selectedGenre = genreId;
    this.currentPage = 1;
    this.browseResults = [];
    this.loadBrowse();
  }

  switchBrowseTab(tab: 'movies' | 'tv') {
    this.activeTab = tab;
    this.selectedGenre = null;
    this.selectedYear = null;
    this.sortBy = 'popularity.desc';
    this.currentPage = 1;
    this.browseResults = [];
    this.loadBrowse();
  }

  setSortBy(sort: string) {
    if (this.sortBy === sort) {
      return;
    }
    this.sortBy = sort;
    this.currentPage = 1;
    this.browseResults = [];
    this.loadBrowse();
  }

  selectGenre(id: number | null) {
    this.selectedGenre = id;
    this.currentPage = 1;
    this.browseResults = [];
    this.loadBrowse();
  }

  setYear(year: number | null) {
    this.selectedYear = year;
    this.currentPage = 1;
    this.browseResults = [];
    this.loadBrowse();
  }

  loadBrowse() {
    this.isLoadingBrowse = true;
    const { excludeLanguages } = this.settingsService.getSettings();
    const params: DiscoverParams = {
      sort_by: this.sortBy,
      page: this.currentPage,
    };
    if (this.selectedGenre) {
      params.with_genres = String(this.selectedGenre);
    }
    if (this.selectedYear) {
      if (this.activeTab === 'movies') {
        params.primary_release_year = this.selectedYear;
      } else {
        params.first_air_date_year = this.selectedYear;
      }
    }
    const obs =
      this.activeTab === 'movies'
        ? this.tmdb.discoverMovies(params)
        : this.tmdb.discoverTv(params);

    obs.subscribe({
      next: (r: any) => {
        let results: any[] = r.results || [];
        if (excludeLanguages?.length) {
          results = results.filter(
            (item: any) => !excludeLanguages.includes(item.original_language),
          );
        }
        this.browseResults =
          this.currentPage === 1
            ? results
            : [...this.browseResults, ...results];
        this.totalPages = r.total_pages;
        this.hasMore = this.currentPage < this.totalPages;
        this.isLoadingBrowse = false;
      },
      error: () => {
        this.isLoadingBrowse = false;
      },
    });
  }

  loadMore() {
    if (this.hasMore && !this.isLoadingBrowse) {
      this.currentPage++;
      this.loadBrowse();
    }
  }

  getGenreColor(genreId: number): string {
    return (
      this.genreColors[genreId] || 'linear-gradient(135deg, #74b9ff, #0984e3)'
    );
  }

  getGenreIcon(genreId: number): string {
    return this.genreIcons[genreId] || 'grid-outline';
  }

  get activeGenres(): any[] {
    return this.activeTab === 'movies' ? this.movieGenres : this.tvGenres;
  }
}
