import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LogSheetComponent, LogSheetItem } from './log-sheet.component';

@Injectable({ providedIn: 'root' })
export class LogSheetService {
  private modal?: HTMLIonModalElement;

  constructor(private modalCtrl: ModalController) {}

  async open(item: LogSheetItem): Promise<void> {
    if (this.modal) {
      await this.modal.dismiss();
      this.modal = undefined;
    }

    this.modal = await this.modalCtrl.create({
      component: LogSheetComponent,
      componentProps: { item },
      breakpoints: [0, 0.75, 0.96],
      initialBreakpoint: 0.75,
      handle: true,
      backdropBreakpoint: 0.3,
      cssClass: 'log-sheet-modal',
    });

    this.modal.onDidDismiss().then(() => {
      this.modal = undefined;
    });

    await this.modal.present();
  }
}
