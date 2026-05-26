import { Injectable, OnDestroy } from '@angular/core';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService implements OnDestroy {
  private readonly onlineSubject = new BehaviorSubject<boolean>(
    navigator.onLine,
  );
  readonly isOnline$ = this.onlineSubject.asObservable();

  private removeListener: (() => Promise<void>) | null = null;

  constructor() {
    this.init();
    window.addEventListener('online', this.onBrowserOnline);
    window.addEventListener('offline', this.onBrowserOffline);
  }

  get isOnline(): boolean {
    return this.onlineSubject.getValue();
  }

  private async init(): Promise<void> {
    try {
      const status = await Network.getStatus();
      this.onlineSubject.next(status.connected);
      const handle = await Network.addListener(
        'networkStatusChange',
        (status) => {
          this.onlineSubject.next(status.connected);
        },
      );
      this.removeListener = () => handle.remove();
    } catch {
      this.onlineSubject.next(navigator.onLine);
    }
  }

  private onBrowserOnline = () => {
    this.onlineSubject.next(true);
  };

  private onBrowserOffline = () => {
    this.onlineSubject.next(false);
  };

  ngOnDestroy(): void {
    window.removeEventListener('online', this.onBrowserOnline);
    window.removeEventListener('offline', this.onBrowserOffline);
    if (this.removeListener) {
      this.removeListener();
    }
  }
}
