import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomList, ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.page.html',
  styleUrls: ['./list-detail.page.scss'],
})
export class ListDetailPage {
  list: CustomList | undefined;

  constructor(
    private route: ActivatedRoute,
    private profileService: ProfileService,
  ) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.list = this.profileService.getList(id);
  }

  removeItem(_mediaType: 'movie' | 'tv', id: number) {
    if (this.list) {
      this.profileService.removeFromList(this.list.id, id);
      this.list = this.profileService.getList(this.list.id);
    }
  }
}
