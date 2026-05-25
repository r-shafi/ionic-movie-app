import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserDataService, UserProfile } from '../../services/user-data.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EditProfileComponent implements OnInit {
  displayName = '';
  bio = '';
  avatarBase64: string | null = null;
  coverBase64: string | null = null;

  constructor(
    private modalCtrl: ModalController,
    private userData: UserDataService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    const profile = this.userData.getProfile();
    this.displayName = profile.displayName;
    this.bio = profile.bio;
    this.avatarBase64 = profile.avatarBase64;
    this.coverBase64 = profile.coverBase64;
  }

  onAvatarPick(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) { return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onCoverPick(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) { return; }
    const reader = new FileReader();
    reader.onload = () => {
      this.coverBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    this.userData.saveProfile({
      displayName: this.displayName || 'Movie Fan',
      bio: this.bio || '',
      avatarBase64: this.avatarBase64,
      coverBase64: this.coverBase64,
    });
    this.toast.showToast('Profile saved.');
    this.modalCtrl.dismiss();
  }

  cancel() {
    this.modalCtrl.dismiss();
  }
}
