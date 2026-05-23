import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingsPageRoutingModule } from './settings-routing.module';
import { SettingsPage } from './settings.page';

@NgModule({
  declarations: [SettingsPage],
  imports: [CommonModule, FormsModule, IonicModule, SettingsPageRoutingModule],
})
export class SettingsPageModule {}
