import { Component } from '@angular/core';
import { AppSettings, SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage {
  settings: AppSettings;

  readonly languages = [
    { code: 'ko', name: 'Korean' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ru', name: 'Russian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'tr', name: 'Turkish' },
    { code: 'th', name: 'Thai' },
  ];

  constructor(private settingsService: SettingsService) {
    this.settings = this.settingsService.getSettings();
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.settingsService.updateSetting('theme', theme);
    this.settings = this.settingsService.getSettings();
  }

  setAdult(value: boolean) {
    this.settingsService.updateSetting('includeAdult', value);
    this.settings = this.settingsService.getSettings();
  }

  setDisplayName(name: string) {
    this.settingsService.updateSetting('displayName', name);
  }

  isLanguageExcluded(code: string): boolean {
    return this.settings.excludeLanguages?.includes(code) ?? false;
  }

  toggleLanguage(code: string) {
    const excludes = [...(this.settings.excludeLanguages || [])];
    const idx = excludes.indexOf(code);
    if (idx > -1) {
      excludes.splice(idx, 1);
    } else {
      excludes.push(code);
    }
    this.settingsService.updateSetting('excludeLanguages', excludes);
    this.settings = this.settingsService.getSettings();
  }
}
