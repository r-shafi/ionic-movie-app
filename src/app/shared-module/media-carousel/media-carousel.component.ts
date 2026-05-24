import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-media-carousel',
    templateUrl: './media-carousel.component.html',
    standalone: false
})
export class MediaCarouselComponent {
  @Input() title = '';
  @Input() items: any[] = [];
  @Input() mediaType: 'movie' | 'tv' = 'movie';
  @Input() seeAllRoute = '';
  @Input() seeAllQueryParams: Record<string, string> | null = null;
  @Input() isLoading = false;

  get skeletons(): number[] {
    return new Array(6).fill(0).map((_, i) => i);
  }
}
