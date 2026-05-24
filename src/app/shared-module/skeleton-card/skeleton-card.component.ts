import { Component } from '@angular/core';

@Component({
    selector: 'app-skeleton-card',
    template: `
    <div class="skeleton-card">
      <div class="skeleton-card__img">
        <ion-skeleton-text animated></ion-skeleton-text>
      </div>
      <ion-skeleton-text
        animated
        style="width:80%;height:12px;margin:5px 0 3px"
      ></ion-skeleton-text>
      <ion-skeleton-text
        animated
        style="width:40%;height:10px"
      ></ion-skeleton-text>
    </div>
  `,
    styles: [
        `
      :host {
        display: block;
        min-width: 0;
      }
      .skeleton-card {
        width: 100%;
      }
      .skeleton-card__img {
        width: 100%;
        aspect-ratio: 2/3;
        border-radius: 8px;
        overflow: hidden;
        ion-skeleton-text {
          width: 100%;
          height: 100%;
          margin: 0;
        }
      }
    `,
    ],
    standalone: false
})
export class SkeletonCardComponent {}
