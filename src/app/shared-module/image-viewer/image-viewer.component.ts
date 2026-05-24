import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss'],
    standalone: false
})
export class ImageViewerComponent {
  @Input() src = '';
  @Input() alt = '';

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  download() {
    const a = document.createElement('a');
    a.href = this.src;
    a.download = this.alt || 'image';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }
}
