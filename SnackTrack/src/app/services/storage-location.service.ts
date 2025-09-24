import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageLocation } from '../models/storage-location.interface';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class StorageLocationService {
  private storageLocationsSubject = new BehaviorSubject<StorageLocation[]>([]);
  public storageLocations$ = this.storageLocationsSubject.asObservable();

  constructor(private supabaseClient: SupabaseClientService) {
    this.loadStorageLocations();
  }

  async loadStorageLocations(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.client
        .from('storage_locations')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Fehler beim Laden der Lagerorte:', error);
        throw error;
      }

      this.storageLocationsSubject.next(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Lagerorte:', err);
      this.storageLocationsSubject.next([]);
    }
  }

  getStorageLocations(): StorageLocation[] {
    return [...this.storageLocationsSubject.value];
  }

  async createStorageLocation(location: Omit<StorageLocation, 'location_id'>): Promise<StorageLocation> {
    // Aktuelle User-ID abrufen
    const { data: userData, error: userError } = await this.supabaseClient.client.auth.getUser();
    if (userError || !userData.user) {
      throw new Error('Benutzer nicht authentifiziert');
    }

    const locationWithUserId = {
      ...location,
      user_id: userData.user.id
    };

    const { data, error } = await this.supabaseClient.client
      .from('storage_locations')
      .insert([locationWithUserId])
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Erstellen des Lagerorts:', error);
      throw error;
    }

    const currentLocations = this.storageLocationsSubject.value;
    const updatedLocations = [...currentLocations, data];
    this.storageLocationsSubject.next(updatedLocations);

    return data;
  }

  async updateStorageLocation(id: string, location: StorageLocation): Promise<StorageLocation> {
    const { data, error } = await this.supabaseClient.client
      .from('storage_locations')
      .update({
        name: location.name,
        updated_at: new Date().toISOString()
      })
      .eq('location_id', id)
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Aktualisieren des Lagerorts:', error);
      throw error;
    }

    const currentLocations = this.storageLocationsSubject.value;
    const index = currentLocations.findIndex(s => s.location_id === id);
    
    if (index !== -1) {
      const updatedLocations = [...currentLocations];
      updatedLocations[index] = data;
      this.storageLocationsSubject.next(updatedLocations);
    }

    return data;
  }

  async deleteStorageLocation(id: string): Promise<void> {
    const { error } = await this.supabaseClient.client
      .from('storage_locations')
      .delete()
      .eq('location_id', id);

    if (error) {
      console.error('Fehler beim Löschen des Lagerorts:', error);
      throw error;
    }

    const currentLocations = this.storageLocationsSubject.value;
    const updatedLocations = currentLocations.filter(s => s.location_id !== id);
    this.storageLocationsSubject.next(updatedLocations);
  }

  subscribeToChanges(callback: (payload: any) => void) {
    return this.supabaseClient.client
      .channel('storage_locations_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'storage_locations' }, 
          callback
      )
      .subscribe();
  }
}