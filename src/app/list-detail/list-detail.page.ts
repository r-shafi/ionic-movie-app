import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserDataService, UserList } from '../services/user-data.service';

@Component({
  selector: 'app-list-detail',
  templateUrl: './list-detail.page.html',
  styleUrls: ['./list-detail.page.scss'],
  standalone: false,
})
export class ListDetailPage {
  list: UserList | null = null;

  constructor(
    private route: ActivatedRoute,
    private userData: UserDataService,
  ) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.list = this.userData.getList(id);
  }

  removeItem(mediaType: string, id: number) {
    if (this.list) {
      this.userData.removeFromList(this.list.id, mediaType, id);
      this.list = this.userData.getList(this.list.id);
    }
  }
}
