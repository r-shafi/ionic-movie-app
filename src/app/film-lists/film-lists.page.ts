import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
import { UserDataService } from '../services/user-data.service';

@Component({
  selector: 'app-film-lists',
  templateUrl: './film-lists.page.html',
  styleUrls: ['./film-lists.page.scss'],
  standalone: false,
})
export class FilmListsPage implements OnInit {
  movieId: number = 0;
  lists: any[] = [];
  currentPage = 1;
  totalPages = 1;
  totalResults = 0;
  isLoading = true;
  hasMore = false;
  sortBy: 'popular' | 'films' | 'recent' | 'alpha' = 'popular';
  animatedBookmarkId: number | null = null;

  readonly sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'films', label: 'Most Films' },
    { value: 'recent', label: 'Recently Created' },
    { value: 'alpha', label: 'Alphabetical' },
  ];

  constructor(
    private route: ActivatedRoute,
    private tmdb: TmdbService,
    private userData: UserDataService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.movieId = +this.route.snapshot.paramMap.get('id')!;
    this.loadLists();
  }

  get sortedLists(): any[] {
    const sorted = [...this.lists];
    switch (this.sortBy) {
      case 'popular':
        return sorted.sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0));
      case 'films':
        return sorted.sort((a, b) => (b.item_count || 0) - (a.item_count || 0));
      case 'recent':
        return sorted.sort((a, b) => b.id - a.id);
      case 'alpha':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      default:
        return sorted;
    }
  }

  private loadLists() {
    this.isLoading = true;
    this.tmdb.getMovieLists(this.movieId, this.currentPage).subscribe({
      next: (data: any) => {
        const results = data.results || [];
        this.lists = this.currentPage === 1 ? results : [...this.lists, ...results];
        this.totalPages = data.total_pages || 1;
        this.totalResults = data.total_results || 0;
        this.hasMore = this.currentPage < this.totalPages;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadMore() {
    if (this.hasMore && !this.isLoading) {
      this.currentPage++;
      this.loadLists();
    }
  }

  setSortBy(value: 'popular' | 'films' | 'recent' | 'alpha') {
    this.sortBy = value;
  }

  openList(list: any) {
    this.router.navigate(['/list', list.id]);
  }

  toggleBookmark(list: any, event: Event) {
    event.stopPropagation();
    if (this.userData.isListBookmarked(list.id)) {
      this.userData.unbookmarkList(list.id);
    } else {
      this.userData.bookmarkList(list);
    }
    this.animatedBookmarkId = list.id;
    setTimeout(() => { this.animatedBookmarkId = null; }, 300);
  }

  isBookmarked(listId: number): boolean {
    return this.userData.isListBookmarked(listId);
  }

  getListCoverItems(list: any): string[] {
    if (list.poster_path) {
      return [`https://image.tmdb.org/t/p/w92${list.poster_path}`];
    }
    if (list.items && list.items.length) {
      return list.items
        .filter((i: any) => i.poster_path)
        .slice(0, 4)
        .map((i: any) => `https://image.tmdb.org/t/p/w92${i.poster_path}`);
    }
    return [];
  }

  getPlaceholderSlots(list: any): number[] {
    const count = 4 - this.getListCoverItems(list).length;
    return count > 0 ? Array(count).fill(0) : [];
  }

  formatCount(n: number): string {
    if (!n) return '\u2013';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }
}
