import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
import { UserDataService } from '../services/user-data.service';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.page.html',
  styleUrls: ['./list-detail.page.scss'],
  standalone: false,
})
export class ListDetailPage implements OnInit {
  list: any = null;
  items: any[] = [];
  currentPage = 1;
  totalPages = 1;
  isLoading = true;
  hasMore = false;
  coverPosters: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private tmdb: TmdbService,
    private userData: UserDataService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadList(id);
  }

  private loadList(id: string) {
    this.isLoading = true;
    this.tmdb.getListDetail(id).subscribe({
      next: (data: any) => {
        this.list = data;
        this.items = data.items || [];
        this.totalPages = data.total_pages || 1;
        this.hasMore = this.currentPage < this.totalPages;
        this.buildCoverPosters();
        this.isLoading = false;
        this.userData.recordListView(data);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  private buildCoverPosters() {
    if (this.list?.poster_path) {
      this.coverPosters = [`https://image.tmdb.org/t/p/w342${this.list.poster_path}`];
      return;
    }
    const posters = (this.list?.items || [])
      .filter((i: any) => i.poster_path)
      .slice(0, 4)
      .map((i: any) => `https://image.tmdb.org/t/p/w154${i.poster_path}`);
    this.coverPosters = posters;
  }

  get isBookmarked(): boolean {
    return this.list ? this.userData.isListBookmarked(this.list.id) : false;
  }

  toggleBookmark() {
    if (!this.list) return;
    if (this.isBookmarked) {
      this.userData.unbookmarkList(this.list.id);
    } else {
      this.userData.bookmarkList(this.list);
    }
  }

  loadMore() {
    if (!this.hasMore || this.isLoading) return;
    this.currentPage++;
    this.isLoading = true;
    this.tmdb.getListDetail(this.list.id).subscribe({
      next: (data: any) => {
        const newItems = (data.items || []).filter(
          (ni: any) => !this.items.some((oi) => oi.id === ni.id && oi.media_type === ni.media_type),
        );
        this.items = [...this.items, ...newItems];
        this.hasMore = this.currentPage < (data.total_pages || 1);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  formatCount(n: number): string {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  get placeholderSlots(): number[] {
    const count = 4 - this.coverPosters.length;
    return count > 0 ? Array(count).fill(0) : [];
  }

}
