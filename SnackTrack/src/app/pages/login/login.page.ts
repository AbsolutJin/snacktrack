import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { ToastService } from '../../services/toast.service';
import { AccountService } from '../../services/account.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { IonItem, IonLabel, IonButton, IonInput } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonLabel, IonButton, IonInput, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {

  loginForm = this.fb.group({
    email: ['', []],
    password: ['', []]
  });
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private toast: ToastService,
    private router: Router,
    private accountService: AccountService
  ) {}

  ngOnInit() {}

  async onLogin() {
    if (this.loginForm.valid) {
      try {
        await this.loginService.login(
          this.loginForm.value.email ?? '',
          this.loginForm.value.password ?? ''
        );
  this.errorMessage = '';
  this.toast.success('Login erfolgreich!');
  console.log('Login erfolgreich!');
  await this.accountService.reload();
  this.router.navigate(['/tabs/dashboard']);
      } catch (error: any) {
        this.errorMessage = error.message || 'Login fehlgeschlagen.';
        this.toast.error(this.errorMessage);
        console.error('Login Fehler:', error);
      }
    } else {
      this.errorMessage = 'Bitte alle Felder ausfüllen.';
      this.toast.warning(this.errorMessage);
      console.warn('Login-Formular ungültig');
    }
  }

}
