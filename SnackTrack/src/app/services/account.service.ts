import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseClientService } from './supabase-client.service';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;   // public URL for display
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private client: SupabaseClient;

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  /** Live profile for UI */
  profile$ = this.profileSubject.asObservable();

  constructor(private supabaseClient: SupabaseClientService) {
    this.client = this.supabaseClient.client;
    // Auto-load once
    void this.reload();
  }

  /** Load current user profile from DB */
  async reload(): Promise<UserProfile | null> {
    const { data: userData, error: userErr } = await this.client.auth.getUser();
    if (userErr || !userData.user) {
      console.error('auth.getUser failed', userErr);
      this.profileSubject.next(null);
      return null;
    }
    const user = userData.user;

    // Read from your `profiles` table — adapt column names if needed
    const { data, error } = await this.client
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('profiles.select failed', error);
      // Create initial row on first run
      const initial: UserProfile = {
        id: user.id,
        username: user.user_metadata?.['username'] || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        avatar_url: null,
      };
      await this.upsertProfile(initial);
      this.profileSubject.next(initial);
      return initial;
    }

    const profile: UserProfile = {
  id: data.id,
  username: data.username,
  email: user.email || '',
  avatar_url: data.avatar_url,
    };
    this.profileSubject.next(profile);
    return profile;
  }

  /** Create/update profile row */
  private async upsertProfile(p: Partial<UserProfile>): Promise<void> {
  // Entferne 'email' aus dem Profil, da es nicht in 'profiles' existiert
  const { email, ...profileData } = p;
  const { error } = await this.client.from('profiles').upsert(profileData, { onConflict: 'id' });
  if (error) throw error;
  }

  /** Update profile fields (and email in auth if changed) */
  async updateProfile(update: Partial<UserProfile>): Promise<void> {
    const current = this.profileSubject.value;
    if (!current) return;

    // If email changed, update auth email first (may require confirmation)
    if (update.email && update.email !== current.email) {
      const { error: e } = await this.client.auth.updateUser({ email: update.email });
      if (e) throw e;
    }

    // Entferne 'email' aus dem Update für die Tabelle 'profiles'
    const { email, ...profileUpdate } = update;
    await this.upsertProfile({ id: current.id, ...profileUpdate });

    // Emit local update
    const next: UserProfile = { ...current, ...update } as UserProfile;
    this.profileSubject.next(next);
  }

  /** Upload new avatar, store public URL + storage path into profile */
  async uploadAvatar(file: File): Promise<string> {
    const current = this.profileSubject.value;
    if (!current) throw new Error('Not authenticated');

    const bucket = 'avatars';
    const fileNameSafe = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const path = `${current.id}/${Date.now()}_${fileNameSafe}`;

    const { error: upErr } = await this.client.storage.from(bucket).upload(path, file, { upsert: true });
    if (upErr) throw upErr;


    const { data: pub } = this.client.storage.from(bucket).getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    await this.upsertProfile({ id: current.id, avatar_url: publicUrl });

    const next: UserProfile = { ...current, avatar_url: publicUrl };
    this.profileSubject.next(next);

    return publicUrl;
  }

  /** Remove avatar and clear fields */
  async removeAvatar(): Promise<void> {
    const current = this.profileSubject.value;
    if (!current) return;

    await this.upsertProfile({ id: current.id, avatar_url: null });
    this.profileSubject.next({ ...current, avatar_url: null });
  }

  /** Change password (user must be logged in) */
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  clearData(): void {
    this.profileSubject.next(null);
  }
}