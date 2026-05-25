import { Component } from '@angular/core';
import { UserDataService } from './services/user-data.service';

export function applyPrimaryColor(color: 'green' | 'red'): void {
  const root = document.documentElement;
  if (color === 'red') {
    root.style.setProperty('--ion-color-primary', '#d90429');
    root.style.setProperty('--ion-color-primary-rgb', '217,4,41');
    root.style.setProperty('--ion-color-primary-contrast', '#ced4da');
    root.style.setProperty('--ion-color-primary-contrast-rgb', '206,212,218');
    root.style.setProperty('--ion-color-primary-shade', '#bf0324');
    root.style.setProperty('--ion-color-primary-tint', '#dd1e3e');
  } else {
    root.style.setProperty('--ion-color-primary', '#76c893');
    root.style.setProperty('--ion-color-primary-rgb', '118,200,147');
    root.style.setProperty('--ion-color-primary-contrast', '#212529');
    root.style.setProperty('--ion-color-primary-contrast-rgb', '33,37,41');
    root.style.setProperty('--ion-color-primary-shade', '#68b382');
    root.style.setProperty('--ion-color-primary-tint', '#84ce9e');
  }
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private userData: UserDataService) {
    applyPrimaryColor(this.userData.getSettings().primaryColor);
  }
}
