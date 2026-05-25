import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
  standalone: false,
})
export class ReviewsPage implements OnInit {
  mediaType: 'movie' | 'tv' = 'movie';
  mediaId!: number;

  allReviews: any[] = [];
  filteredReviews: any[] = [];
  isLoading = true;

  searchQuery = '';
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' = 'newest';
  private targetReviewId = '';
  focusedReviewId = '';

  constructor(
    private route: ActivatedRoute,
    private tmdb: TmdbService,
  ) {}

  ngOnInit() {
    const segments = this.route.snapshot.pathFromRoot
      .reduce((acc: any[], s) => acc.concat(s.url), [])
      .map((s: any) => s.path);
    this.mediaType = segments.includes('movie') ? 'movie' : 'tv';
    this.mediaId = +this.route.snapshot.paramMap.get('id')!;
    this.targetReviewId =
      this.route.snapshot.queryParamMap.get('reviewId') || '';

    const obs =
      this.mediaType === 'movie'
        ? this.tmdb.getMovieReviews(this.mediaId)
        : this.tmdb.getTvReviews(this.mediaId);

    obs.subscribe({
      next: (data: any) => {
        this.allReviews = data.results || [];
        this.applyFilters();
        this.isLoading = false;
        this.focusTargetReview();
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value || '';
    this.applyFilters();
  }

  onSortChange(sort: 'newest' | 'oldest' | 'highest' | 'lowest') {
    this.sortBy = sort;
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.allReviews];

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.author.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q),
      );
    }

    switch (this.sortBy) {
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case 'oldest':
        result.sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );
        break;
      case 'highest':
        result.sort(
          (a, b) =>
            (b.author_details?.rating ?? 0) - (a.author_details?.rating ?? 0),
        );
        break;
      case 'lowest':
        result.sort(
          (a, b) =>
            (a.author_details?.rating ?? 0) - (b.author_details?.rating ?? 0),
        );
        break;
    }

    this.filteredReviews = result;
    this.focusTargetReview();
  }

  reviewElementId(id: any): string {
    return `review-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
  }

  private focusTargetReview() {
    if (
      !this.targetReviewId ||
      this.isLoading ||
      !this.filteredReviews.length
    ) {
      return;
    }
    const found = this.filteredReviews.some(
      (review) => String(review.id) === this.targetReviewId,
    );
    if (!found) {
      return;
    }

    const elementId = this.reviewElementId(this.targetReviewId);
    requestAnimationFrame(() => {
      const el = document.getElementById(elementId);
      if (!el) {
        return;
      }
      this.focusedReviewId = this.targetReviewId;
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        this.focusedReviewId = '';
      }, 1800);
      this.targetReviewId = '';
    });
  }

  getAvatarUrl(review: any): string {
    const avatar = review.author_details?.avatar_path;
    if (!avatar) return 'assets/icon/favicon.png';
    return avatar.startsWith('/https')
      ? avatar.slice(1)
      : `https://image.tmdb.org/t/p/w45${avatar}`;
  }

  toStr(value: any): string {
    return String(value);
  }
}
