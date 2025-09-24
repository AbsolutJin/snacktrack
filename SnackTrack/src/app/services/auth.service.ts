import { Injectable } from '@angular/core';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabaseClient: SupabaseClientService) {}

  async signIn(email: string, password: string): Promise<{ error: any }> {
    const { error } = await this.supabaseClient.client.auth.signInWithPassword({ email, password });
    return { error };
  }

  async signUp(email: string, password: string): Promise<{ error: any }> {
    const { error } = await this.supabaseClient.client.auth.signUp({ email, password });
    return { error };
  }

  async signOut(): Promise<{ error: any }> {
    const { error } = await this.supabaseClient.client.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data, error } = await this.supabaseClient.client.auth.getUser();
    return { data, error };
  }

  async resetPassword(email: string): Promise<{ error: any }> {
    const { error } = await this.supabaseClient.client.auth.resetPasswordForEmail(email);
    return { error };
  }

  async updatePassword(password: string): Promise<{ error: any }> {
    const { error } = await this.supabaseClient.client.auth.updateUser({ password });
    return { error };
  }
}