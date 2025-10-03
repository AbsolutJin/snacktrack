import { Component, OnDestroy, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { AccountService, UserProfile } from '../../services/account.service';
import { AuthService } from '../../services/auth.service';
import { LoginService } from '../../services/login.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { ChangePasswordModal } from './change-password.modal';

// Ionicons registration (ensure icons display reliably)
import { addIcons } from 'ionicons';
import { cameraOutline, trashOutline, saveOutline, closeOutline, mailOutline, callOutline, personOutline } from 'ionicons/icons';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';

@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
  imports: [CommonModule, FormsModule, ...IONIC_COMPONENTS],
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
    private toast: ToastService,
    private auth: AuthService,
    private loginService: LoginService,
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
      await this.toast.success('Profilbild aktualisiert');
    } catch (e) {
      console.error(e);
      await this.toast.error('Fehler beim Hochladen des Profilbilds');
    } finally {
      input.value = '';
    }
  }

  async removeAvatar() {
    try {
      await this.account.removeAvatar();
      this.avatarDataUrl = null;
      await this.toast.success('Profilbild entfernt');
    } catch (e) {
      console.error(e);
      await this.toast.error('Fehler beim Entfernen des Profilbilds');
    }
  }

  // Profile save
  async saveProfile() {
    try {
      const { id, ...payload } = this.user; // never update id
      await this.account.updateProfile(payload);
      await this.toast.success('Profil gespeichert');
      // update originals so Save button disables again
      this.originalUsername = this.user.username || '';
      this.originalEmail = this.user.email || '';
      try {
        this.profileForm.form.markAsPristine();
      } catch {}
    } catch (e) {
      console.error(e);
      await this.toast.error('Speichern fehlgeschlagen');
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
      this.loginService.logout();
      const { error } = await this.auth.signOut();
      if (error) throw error;
      await this.router.navigate(['/login']);
    } catch (e) {
      console.error('Logout failed', e);
      await this.toast.error('Abmelden fehlgeschlagen');
    }
  }
}