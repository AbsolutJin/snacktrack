import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  template: `
  <ion-header>
    <ion-toolbar>
      <ion-title>Passwort ändern</ion-title>
      <ion-buttons slot="end">
        <ion-button (click)="dismiss()" aria-label="Schließen">
          <ion-icon name="close-outline"></ion-icon>
        </ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>
  <ion-content class="ion-padding">
    <form (ngSubmit)="submit()" #form="ngForm">
      <ion-item>
        <ion-label position="stacked">Neues Passwort</ion-label>
        <ion-input type="password" required [(ngModel)]="password" name="password"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label position="stacked">Bestätigen</ion-label>
        <ion-input type="password" required [(ngModel)]="confirm" name="confirm"></ion-input>
      </ion-item>
      <div class="ion-padding-top">
        <ion-button expand="block" type="submit" [disabled]="!password || password !== confirm">Speichern</ion-button>
      </div>
    </form>
  </ion-content>
  `,
})
export class ChangePasswordModal {
  password = '';
  confirm = '';

  constructor(private modalCtrl: ModalController, private account: AccountService, private toast: ToastController) {}

  dismiss() { this.modalCtrl.dismiss(); }

  async submit() {
    try {
      await this.account.changePassword(this.password);
      await this.presentToast('Passwort aktualisiert');
      this.dismiss();
    } catch (e) {
      console.error(e);
      await this.presentToast('Aktualisierung fehlgeschlagen');
    }
  }

  private async presentToast(message: string) {
    const t = await this.toast.create({ message, duration: 1700, position: 'bottom' });
    await t.present();
  }
}