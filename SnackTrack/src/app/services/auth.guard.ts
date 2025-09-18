import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private supabase: SupabaseService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const session = this.supabase.client.auth.getSession ? await this.supabase.client.auth.getSession() : null;
    if (session && session.data && session.data.session) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}
