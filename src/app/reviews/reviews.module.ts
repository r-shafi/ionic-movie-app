import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ReviewsPageRoutingModule } from './reviews-routing.module';
import { ReviewsPage } from './reviews.page';

@NgModule({
  declarations: [ReviewsPage],
  imports: [CommonModule, IonicModule, ReviewsPageRoutingModule],
})
export class ReviewsPageModule {}
