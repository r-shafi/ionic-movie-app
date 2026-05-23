import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from '../shared-module/shared-module.module';
import { PersonPageRoutingModule } from './person-routing.module';
import { PersonPage } from './person.page';

@NgModule({
  declarations: [PersonPage],
  imports: [
    CommonModule,
    IonicModule,
    PersonPageRoutingModule,
    SharedModuleModule,
  ],
})
export class PersonPageModule {}
