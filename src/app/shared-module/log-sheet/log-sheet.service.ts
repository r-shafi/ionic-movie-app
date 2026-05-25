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
      breakpoints: [0, 0.6, 0.92],
      initialBreakpoint: 0.6,
      presentingElement: this.getPresentingElement(),
    });

    this.modal.onDidDismiss().then(() => {
      this.modal = undefined;
    });

    await this.modal.present();
  }

  private getPresentingElement(): HTMLElement | undefined {
    const outlet = document.querySelector('ion-router-outlet');
    return (outlet as HTMLElement) || undefined;
  }
}
