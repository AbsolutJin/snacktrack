import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private supabase: SupabaseService) {}

  async login(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.signIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
  }
}
