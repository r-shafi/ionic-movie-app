import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  language: string;
  region: string;
  includeAdult: boolean;
  displayName: string;
  excludeLanguages: string[];
}

const DEFAULTS: AppSettings = {
  theme: 'system',
  language: 'en-US',
  region: 'US',
  includeAdult: false,
  displayName: 'Movie Fan',
  excludeLanguages: [],
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'appSettings';
  public settings$: BehaviorSubject<AppSettings>;

  constructor() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const initial: AppSettings = stored
      ? { ...DEFAULTS, ...JSON.parse(stored) }
      : { ...DEFAULTS };
    this.settings$ = new BehaviorSubject<AppSettings>(initial);
    this.applyTheme(initial.theme);
  }

  get settings(): AppSettings {
    return this.settings$.getValue();
  }

  getSettings(): AppSettings {
    return this.settings$.getValue();
  }

  updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): void {
    const updated = { ...this.settings, [key]: value };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    this.settings$.next(updated);
    if (key === 'theme') {
      this.applyTheme(value as AppSettings['theme']);
    }
  }

  applyTheme(theme: AppSettings['theme']): void {
    const body = document.body;
    body.classList.remove('dark', 'light');
    if (theme === 'dark') {
      body.classList.add('dark');
    } else if (theme === 'light') {
      body.classList.add('light');
    } else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        body.classList.add('dark');
      }
    }
  }
}
