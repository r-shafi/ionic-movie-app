import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { applyPrimaryColor } from '../app.component';
import { ToastService } from '../services/toast.service';
import { AppSettings, UserDataService } from '../services/user-data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class SettingsPage {
  readonly appVersion = '0.0.1';
  readonly githubRepoUrl = 'https://github.com/r-shafi/ionic-movie-app';

  constructor(
    public userData: UserDataService,
    private alertCtrl: AlertController,
    private toast: ToastService,
  ) {}

  get settings(): AppSettings {
    return this.userData.getSettings();
  }

  get safeSearch(): boolean {
    return !this.settings.includeAdult;
  }

  setTheme(theme: 'system' | 'light' | 'dark') {
    this.userData.saveSetting('theme', theme);
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

  setFadeWatched(value: boolean) {
    this.userData.saveSetting('fadeWatched', value);
  }

  setDefaultMediaTab(value: 'movies' | 'tv') {
    this.userData.saveSetting('defaultMediaTab', value);
  }

  setSafeSearch(value: boolean) {
    this.userData.saveSetting('includeAdult', !value);
  }

  setPrimaryColor(color: 'green' | 'red') {
    this.userData.saveSetting('primaryColor', color);
    applyPrimaryColor(color);
  }

  exportData() {
    const keys = [
      'mva_profile',
      'mva_watched',
      'mva_watchlist',
      'mva_favorites',
      'mva_lists',
      'mva_settings',
    ];
    const dump: Record<string, unknown> = {};
    keys.forEach((k) => {
      dump[k] = JSON.parse(localStorage.getItem(k) ?? 'null');
    });
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'movieapp-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    this.toast.showToast('Data exported.');
  }

  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          const keys = [
            'mva_profile',
            'mva_watched',
            'mva_watchlist',
            'mva_favorites',
            'mva_lists',
            'mva_settings',
          ];
          keys.forEach((k) => {
            if (data[k] !== undefined) {
              localStorage.setItem(k, JSON.stringify(data[k]));
            }
          });
          this.toast.showToast('Data imported. Reload to see changes.');
        } catch {
          this.toast.showToast('Invalid file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  async clearWatchLog() {
    const alert = await this.alertCtrl.create({
      header: 'Clear watch log?',
      message: 'This will remove all watched entries. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear',
          role: 'destructive',
          handler: () => {
            localStorage.removeItem('mva_watched');
            this.toast.showToast('Watch log cleared.');
          },
        },
      ],
    });
    await alert.present();
  }

  async clearAllData() {
    const alert = await this.alertCtrl.create({
      header: 'Clear all data?',
      message:
        'This will remove all your profile, watched, watchlist, favorites, lists, and settings. This cannot be undone.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Clear everything',
          role: 'destructive',
          handler: async () => {
            const confirm = await this.alertCtrl.create({
              header: 'Are you sure?',
              message: 'All local data will be permanently deleted.',
              buttons: [
                { text: 'Cancel', role: 'cancel' },
                {
                  text: 'Delete all',
                  role: 'destructive',
                  handler: () => {
                    [
                      'mva_profile',
                      'mva_watched',
                      'mva_watchlist',
                      'mva_favorites',
                      'mva_lists',
                      'mva_settings',
                    ].forEach((k) => localStorage.removeItem(k));
                    this.toast.showToast('All data cleared. Reload to reset.');
                  },
                },
              ],
            });
            await confirm.present();
          },
        },
      ],
    });
    await alert.present();
  }
}
