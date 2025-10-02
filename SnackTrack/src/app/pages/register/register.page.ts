import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { AccountService } from '../../services/account.service';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ...IONIC_COMPONENTS]
})
export class RegisterPage {
  email = '';
  password = '';
  username = '';
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private account: AccountService,
    private toast: ToastService,
    private router: Router
  ) {}

  async onRegister() {
    if (!this.email || !this.password || !this.username) {
      this.errorMessage = 'Bitte alle Felder ausfüllen.';
      this.toast.warning(this.errorMessage);
      return;
    }

    try {
      const { error } = await this.auth.signUp(this.email, this.password);
      if (error) throw error;

      // create profile row using AccountService reload/upsert
      await this.account.reload();
      // Optionally update username
      await this.account.updateProfile({ username: this.username, email: this.email });

      this.toast.success('Registrierung erfolgreich. Bitte prüfe ggf. deine E-Mails zur Aktivierung.');
      this.router.navigate(['/login']);
    } catch (e: any) {
      console.error('Registration failed', e);
      this.errorMessage = e.message || 'Registrierung fehlgeschlagen.';
      this.toast.error(this.errorMessage);
    }
  }
}
