import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NetworkService } from 'src/app/services/network.service';

@Component({
  selector: 'app-offline-banner',
  template: `
    @if (!isOnline) {
      <div class="offline-banner">
        <ion-icon name="cloud-offline-outline"></ion-icon>
        No internet connection
      </div>
    }
  `,
  styles: [
    `
      .offline-banner {
        background: var(--ion-color-danger);
        color: #fff;
        text-align: center;
        padding: 6px 16px;
        padding-top: calc(6px + env(safe-area-inset-top));
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        position: sticky;
        top: 0;
        z-index: 9999;
      }
    `,
  ],
  standalone: false,
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  isOnline = true;
  private sub = Subscription.EMPTY;

  constructor(private network: NetworkService) {}

  ngOnInit() {
    this.sub = this.network.isOnline$.subscribe((isOnline) => {
      this.isOnline = isOnline;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
