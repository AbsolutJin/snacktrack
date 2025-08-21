import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { ChangePasswordModal } from './change-password.modal';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, IonButton, IonCard, IonCardContent, IonItem, IonLabel, IonInput, IonButtons, IonBackButton]
})
export class AccountPage implements OnInit {

  user: { name: string; email: string; phone?: string } = {
    name: 'Max Mustermann',
    email: 'max.mustermann@example.com',
    phone: '+49 123 456789'
  };

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
  }

  saveProfile() {
    // Hier würde man das Profil an einen Service senden. Für jetzt nur console.log
    console.log('Profil speichern', this.user);
  }

  async openChangePassword() {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordModal,
      componentProps: {}
    });
    await modal.present();
    const res = await modal.onDidDismiss();
    if (res && res.data && res.data.changed) {
      // optionally show toast
      console.log('Password changed');
    }
  }

}
