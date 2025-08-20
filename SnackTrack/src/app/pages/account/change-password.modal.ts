import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonList, IonButtons, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'change-password-modal',
  template: `
  <ion-header>
    <ion-toolbar class="toolbar-brand">
      <ion-buttons slot="start">
        <ion-back-button text="" (click)="dismiss()"></ion-back-button>
      </ion-buttons>
      <ion-title>Passwort ändern</ion-title>
    </ion-toolbar>
  </ion-header>

  <ion-content class="modal-content">
    <form (ngSubmit)="changePassword()" #pwForm="ngForm">
      <ion-list>
        <ion-item>
          <ion-label position="stacked">Altes Passwort</ion-label>
          <ion-input type="password" name="oldPw" [(ngModel)]="oldPw" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Neues Passwort</ion-label>
          <ion-input type="password" name="newPw" [(ngModel)]="newPw" minlength="6" required></ion-input>
        </ion-item>

        <ion-item>
          <ion-label position="stacked">Neues Passwort bestätigen</ion-label>
          <ion-input type="password" name="confirmPw" [(ngModel)]="confirmPw" required></ion-input>
        </ion-item>
      </ion-list>

      <div class="modal-actions">
        <ion-button expand="block" type="submit" [disabled]="pwForm.invalid || newPw !== confirmPw">Ändern</ion-button>
        <ion-button expand="block" fill="clear" (click)="dismiss()">Abbrechen</ion-button>
      </div>
    </form>
  </ion-content>
  `,
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonList, IonButtons, IonBackButton]
})
export class ChangePasswordModal {
  oldPw = '';
  newPw = '';
  confirmPw = '';

  constructor(private modalCtrl: ModalController) {}

  dismiss(data: any = null) {
    this.modalCtrl.dismiss(data);
  }

  changePassword() {
    // Minimaler Client-side check; echte Änderung via Service
    if (!this.oldPw || !this.newPw) return;
    if (this.newPw !== this.confirmPw) return;
    // Simuliere erfolgreichen Wechsel
    this.modalCtrl.dismiss({ changed: true });
  }
}
