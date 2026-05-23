import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-offline-banner',
  template: `
    <div class="offline-banner" *ngIf="!isOnline">
      <ion-icon name="cloud-offline-outline"></ion-icon>
      No internet connection
    </div>
  `,
  styles: [
    `
      .offline-banner {
        background: var(--ion-color-danger);
        color: #fff;
        text-align: center;
        padding: 6px 16px;
        font-size: 0.8rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
    `,
  ],
})
export class OfflineBannerComponent implements OnInit, OnDestroy {
  isOnline = navigator.onLine;

  private onOnline = () => {
    this.isOnline = true;
  };
  private onOffline = () => {
    this.isOnline = false;
  };

  ngOnInit() {
    window.addEventListener('online', this.onOnline);
    window.addEventListener('offline', this.onOffline);
  }

  ngOnDestroy() {
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('offline', this.onOffline);
  }
}
