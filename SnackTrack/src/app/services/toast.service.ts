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
      duration: 2500,
      color,
      position: 'middle',
    });
    await toast.present();

        // Toast wird bei Klick auf den Bildschirm verworfen
    const clickHandler = () => {
      toast.dismiss();
      document.removeEventListener('click', clickHandler);
    };

    document.addEventListener('click', clickHandler, { once: true });
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

  /**
   * Show a toast with custom position and duration.
   * position: 'top' | 'middle' | 'bottom'
   */
  async showCustom(message: string, color: 'success' | 'danger' | 'warning', position: 'top' | 'middle' | 'bottom' = 'bottom', duration = 3500) {
    const toast = await this.toastController.create({
      message,
      duration,
      color,
      position,
    });
    await toast.present();

    const clickHandler = () => {
      toast.dismiss();
      document.removeEventListener('click', clickHandler);
    };

    document.addEventListener('click', clickHandler, { once: true });
  }
}