import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class StarRatingComponent {
  @Input() rating: number | null = null;
  @Input() readonly = false;
  @Output() ratingChange = new EventEmitter<number | null>();

  readonly stars = [1, 2, 3, 4, 5];

  fillPercent(star: number): number {
    const value = this.rating ?? 0;
    if (value >= star) {
      return 100;
    }
    if (value >= star - 0.5) {
      return 50;
    }
    return 0;
  }

  selectRating(event: MouseEvent, star: number): void {
    if (this.readonly) {
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const isHalf = event.clientX - rect.left < rect.width / 2;
    const next = star - (isHalf ? 0.5 : 0);
    const value = Math.round(next * 2) / 2;
    this.ratingChange.emit(this.rating === value ? null : value);
  }
}
