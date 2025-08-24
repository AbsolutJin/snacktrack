import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastController: ToastController) {}

  private async show(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  success(message: string) {
    return this.show(message, 'success');
  }

  error(message: string) {
    return this.show(message, 'danger');
  }

  warning(message: string) {
    return this.show(message, 'warning');
  }
}