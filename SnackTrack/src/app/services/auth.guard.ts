import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const { data, error } = await this.authService.getCurrentUser();
    
    if (!error && data?.user) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
