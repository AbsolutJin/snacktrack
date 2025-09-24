import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private authService: AuthService) {}

  async login(email: string, password: string): Promise<void> {
    const { error } = await this.authService.signIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
  }
}
