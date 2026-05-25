import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModuleModule } from 'src/app/shared-module/shared-module.module';
import { UserReviewsPageRoutingModule } from './user-reviews-routing.module';
import { UserReviewsPage } from './user-reviews.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserReviewsPageRoutingModule,
    SharedModuleModule,
  ],
  declarations: [UserReviewsPage],
})
export class UserReviewsPageModule {}
