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

  // Data URL for avatar image (stored in localStorage)
  avatarDataUrl: string | null = null;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    // Lade gespeichertes Avatar (falls vorhanden)
    try {
      const saved = localStorage.getItem('profileAvatar');
      if (saved) this.avatarDataUrl = saved;
    } catch (e) {
      // localStorage kann in manchen Umgebungen fehlschlagen
      console.warn('Could not read profileAvatar from localStorage', e);
    }
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

  onAvatarClick(fileInput: HTMLInputElement) {
    // Öffnet den versteckten Datei-Dialog
    fileInput.click();
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    // Nur Bilder zulassen
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarDataUrl = reader.result as string;
      try {
        localStorage.setItem('profileAvatar', this.avatarDataUrl!);
      } catch (e) {
        console.warn('Could not save profileAvatar to localStorage', e);
      }
    };
    reader.readAsDataURL(file);

    // Reset input value so derselbe Datei-Name wieder ausgelöst werden kann
    input.value = '';
  }

  removeAvatar() {
    this.avatarDataUrl = null;
    try {
      localStorage.removeItem('profileAvatar');
    } catch (e) {
      console.warn('Could not remove profileAvatar from localStorage', e);
    }
  }

}
