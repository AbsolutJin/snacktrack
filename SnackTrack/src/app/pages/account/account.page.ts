import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { IonicModule, ModalController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { AccountService, UserProfile } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ChangePasswordModal } from './change-password.modal';

// Ionicons registration (ensure icons display reliably)
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline, saveOutline, closeOutline, mailOutline, callOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class AccountPage implements OnInit, OnDestroy {
  user: UserProfile = { id: '', username: '', email: '' };
  avatarDataUrl: string | null = null; // local preview or service value

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('profileForm') profileForm!: NgForm;

  private sub?: Subscription;
  private originalUsername = '';
  private originalEmail = '';

  constructor(
    private account: AccountService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private router: Router,
  ) {
    addIcons({ cameraOutline, trashOutline, saveOutline, closeOutline, mailOutline, callOutline, personOutline });
  }

  ngOnInit(): void {
    this.sub = this.account.profile$.subscribe((p) => {
      if (!p) return;
  this.user = { ...p };
  this.avatarDataUrl = p.avatar_url || null;
      // save originals for change-detection
      this.originalUsername = this.user.username || '';
      this.originalEmail = this.user.email || '';
    });
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

  // Avatar interactions
  onAvatarClick(input: HTMLInputElement) {
    input.click();
  }

  async onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // local preview
    const reader = new FileReader();
    reader.onload = () => { this.avatarDataUrl = reader.result as string; };
    reader.readAsDataURL(file);

    try {
      const publicUrl = await this.account.uploadAvatar(file);
      this.avatarDataUrl = publicUrl;
      await this.presentToast('Profilbild aktualisiert');
    } catch (e) {
      console.error(e);
      await this.presentToast('Fehler beim Hochladen des Profilbilds');
    } finally {
      input.value = '';
    }
  }

  async removeAvatar() {
    try {
      await this.account.removeAvatar();
      this.avatarDataUrl = null;
      await this.presentToast('Profilbild entfernt');
    } catch (e) {
      console.error(e);
      await this.presentToast('Fehler beim Entfernen des Profilbilds');
    }
  }

  // Profile save
  async saveProfile() {
    try {
      const { id, ...payload } = this.user; // never update id
      await this.account.updateProfile(payload);
      await this.presentToast('Profil gespeichert');
      // update originals so Save button disables again
      this.originalUsername = this.user.username || '';
      this.originalEmail = this.user.email || '';
      try {
        this.profileForm.form.markAsPristine();
      } catch {}
    } catch (e) {
      console.error(e);
      await this.presentToast('Speichern fehlgeschlagen');
    }
  }

  get hasChanges(): boolean {
    return (this.user.username || '') !== (this.originalUsername || '') || (this.user.email || '') !== (this.originalEmail || '');
  }

  async openChangePassword() {
    const modal = await this.modalCtrl.create({ component: ChangePasswordModal });
    await modal.present();
  }

  async logout() {
    try {
      const { error } = await this.auth.signOut();
      if (error) throw error;
      await this.router.navigate(['/login']);
    } catch (e) {
      console.error('Logout failed', e);
      await this.presentToast('Abmelden fehlgeschlagen');
    }
  }

  private async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 1700, position: 'bottom' });
    await toast.present();
  }
}