import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageLocationInterface } from '../models/storage-location.interface';
import { FoodCategoryInterface } from '../models/food-category.interface';
import { FoodItemInterface } from '../models/food-item.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  /** Public access to the underlying Supabase client for other services */
  public readonly client: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  this.client = this.supabase;
  }

  // Storage Locations CRUD
  async getStorageLocations(): Promise<StorageLocationInterface[]> {
    const { data, error } = await this.supabase
      .from('storage_locations')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der Lagerorte:', error);
      throw error;
    }

    return data || [];
  }

  async createStorageLocation(location: Omit<StorageLocationInterface, 'id'>): Promise<StorageLocationInterface> {
    const { data, error } = await this.supabase
      .from('storage_locations')
      .insert([location])
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Erstellen des Lagerorts:', error);
      throw error;
    }

    return data;
  }

  async updateStorageLocation(id: string, location: StorageLocationInterface): Promise<StorageLocationInterface> {
    const { data, error } = await this.supabase
      .from('storage_locations')
      .update({
        name: location.name,
        color: location.color,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Aktualisieren des Lagerorts:', error);
      throw error;
    }

    return data;
  }

  async deleteStorageLocation(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('storage_locations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Löschen des Lagerorts:', error);
      throw error;
    }
  }

  // Categories CRUD
  async getCategories(): Promise<FoodCategoryInterface[]> {
    const { data, error } = await this.supabase
      .from('food_categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      throw error;
    }

    return data || [];
  }

  async createCategory(category: Omit<FoodCategoryInterface, 'id'>): Promise<FoodCategoryInterface> {
    const { data, error } = await this.supabase
      .from('food_categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Erstellen der Kategorie:', error);
      throw error;
    }

    return data;
  }

  async updateCategory(id: string, category: FoodCategoryInterface): Promise<FoodCategoryInterface> {
    const { data, error } = await this.supabase
      .from('food_categories')
      .update({
        name: category.name,
        icon: category.icon,
        color: category.color,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      throw error;
    }

    return data;
  }

  async deleteCategory(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('food_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      throw error;
    }
  }

  // Food Items CRUD
  async getFoodItems(): Promise<FoodItemInterface[]> {
    const { data, error } = await this.supabase
      .from('food_items')
      .select(`
        *,
        storage_location:storage_locations(*),
        category:food_categories(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Food Items:', error);
      throw error;
    }

    return data?.map(item => ({
      ...item,
      expiryDate: new Date(item.expiry_date),
      addedDate: new Date(item.added_date),
      storageLocation: item.storage_location,
      category: item.category
    })) || [];
  }

  async createFoodItem(item: Omit<FoodItemInterface, 'id'>): Promise<FoodItemInterface> {
    const { data, error } = await this.supabase
      .from('food_items')
      .insert([{
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiryDate.toISOString(),
        added_date: item.addedDate.toISOString(),
        storage_location_id: item.storageLocation.id,
        category_id: item.category.id
      }])
      .select(`
        *,
        storage_location:storage_locations(*),
        category:food_categories(*)
      `)
      .single();

    if (error) {
      console.error('Fehler beim Erstellen des Food Items:', error);
      throw error;
    }

    return {
      ...data,
      expiryDate: new Date(data.expiry_date),
      addedDate: new Date(data.added_date),
      storageLocation: data.storage_location,
      category: data.category
    };
  }

  async updateFoodItem(id: string, item: FoodItemInterface): Promise<FoodItemInterface> {
    const { data, error } = await this.supabase
      .from('food_items')
      .update({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        expiry_date: item.expiryDate.toISOString(),
        storage_location_id: item.storageLocation.id,
        category_id: item.category.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        storage_location:storage_locations(*),
        category:food_categories(*)
      `)
      .single();

    if (error) {
      console.error('Fehler beim Aktualisieren des Food Items:', error);
      throw error;
    }

    return {
      ...data,
      expiryDate: new Date(data.expiry_date),
      addedDate: new Date(data.added_date),
      storageLocation: data.storage_location,
      category: data.category
    };
  }

  async deleteFoodItem(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('food_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Fehler beim Löschen des Food Items:', error);
      throw error;
    }
  }

  // Real-time Subscriptions (optional)
  subscribeToStorageLocations(callback: (payload: any) => void) {
    return this.supabase
      .channel('storage_locations_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'storage_locations' }, 
          callback
      )
      .subscribe();
  }

  subscribeToCategories(callback: (payload: any) => void) {
    return this.supabase
      .channel('categories_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'food_categories' }, 
          callback
      )
      .subscribe();
  }

  subscribeToFoodItems(callback: (payload: any) => void) {
    return this.supabase
      .channel('food_items_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'food_items' }, 
          callback
      )
      .subscribe();
  }
}