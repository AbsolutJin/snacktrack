import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { SupabaseClient } from '@supabase/supabase-js';

// If you already have a SupabaseService that exposes a `client: SupabaseClient`,
// import it and inject below.
import { SupabaseService } from '../services/supabase.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;   // public URL for display
  avatar_path?: string | null;  // storage path for deletion
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private client: SupabaseClient;

  private profileSubject = new BehaviorSubject<UserProfile | null>(null);
  /** Live profile for UI */
  profile$ = this.profileSubject.asObservable();

  constructor(private supa: SupabaseService) {
    // Assume your existing wrapper exposes the Supabase client
    this.client = this.supa.client as SupabaseClient;
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
      .select('id, name, email, phone, avatar_url, avatar_path')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('profiles.select failed', error);
      // Create initial row on first run
      const initial: UserProfile = {
        id: user.id,
        name: user.user_metadata?.['name'] || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: null,
        avatar_url: null,
        avatar_path: null,
      };
      await this.upsertProfile(initial);
      this.profileSubject.next(initial);
      return initial;
    }

    const profile: UserProfile = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      avatar_path: data.avatar_path,
    };
    this.profileSubject.next(profile);
    return profile;
  }

  /** Create/update profile row */
  private async upsertProfile(p: Partial<UserProfile>): Promise<void> {
    const { error } = await this.client.from('profiles').upsert(p, { onConflict: 'id' });
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

    await this.upsertProfile({ id: current.id, ...update });

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

    // Optional: remove previous avatar file if we tracked its path
    if (current.avatar_path) {
      await this.client.storage.from(bucket).remove([current.avatar_path]);
    }

    const { data: pub } = this.client.storage.from(bucket).getPublicUrl(path);
    const publicUrl = pub.publicUrl;

    await this.upsertProfile({ id: current.id, avatar_url: publicUrl, avatar_path: path });

    const next: UserProfile = { ...current, avatar_url: publicUrl, avatar_path: path };
    this.profileSubject.next(next);

    return publicUrl;
  }

  /** Remove avatar and clear fields */
  async removeAvatar(): Promise<void> {
    const current = this.profileSubject.value;
    if (!current) return;

    if (current.avatar_path) {
      await this.client.storage.from('avatars').remove([current.avatar_path]);
    }
    await this.upsertProfile({ id: current.id, avatar_url: null, avatar_path: null });
    this.profileSubject.next({ ...current, avatar_url: null, avatar_path: null });
  }

  /** Change password (user must be logged in) */
  async changePassword(newPassword: string): Promise<void> {
    const { error } = await this.client.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }
}