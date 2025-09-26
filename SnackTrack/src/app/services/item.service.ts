import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from '../models/item.interface';
import { FoodItemInterface } from '../models/food-item.interface';
import { ProductInfo } from './openfoodfacts.service';
import { SupabaseClientService } from './supabase-client.service';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private itemsSubject = new BehaviorSubject<Item[]>([]);
  public items$ = this.itemsSubject.asObservable();

  private foodItemsSubject = new BehaviorSubject<FoodItemInterface[]>([]);
  public foodItems$ = this.foodItemsSubject.asObservable();

  constructor(private supabaseClient: SupabaseClientService) {
    this.loadItems();
    this.loadFoodItems();
  }

  async loadItems(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.client
        .from('items')
        .select('*');
      if (error) throw error;
      this.itemsSubject.next(data || []);
    } catch (err) {
      console.error('Fehler beim Laden der Items:', err);
      this.itemsSubject.next([]);
    }
  }

  async loadFoodItems(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.client
        .from('items')
        .select('*');

      if (error) {
        console.error('Fehler beim Laden der Food Items:', error);
        throw error;
      }

      const foodItems = data || [];
      this.foodItemsSubject.next(foodItems);
    } catch (error) {
      console.error('Fehler beim Laden der Food Items:', error);
      throw error;
    }
  }

  getItems(): Item[] {
    return [...this.itemsSubject.value];
  }

  getFoodItems(): FoodItemInterface[] {
    return this.foodItemsSubject.value;
  }

  async getItemByBarcode(barcode: string): Promise<Item | null> {
    try {
      const { data, error } = await this.supabaseClient.client
        .from('items')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching item by barcode:', error);
      return null;
    }
  }

  async saveNewItem(product: ProductInfo): Promise<void> {
    try {
      const newItem: Omit<Item, 'last_fetched'> = {
        barcode: product.barcode,
        product_name: product.product_name,
        brand: product.brand,
        quantity: product.quantity,
        image_url: product.image_url
      };

      const { error } = await this.supabaseClient.client
        .from('items')
        .insert([newItem]);

      if (error) {
        throw error;
      }

      const currentItems = this.itemsSubject.value;
      const updatedItem: Item = {
        ...newItem,
        last_fetched: new Date().toISOString()
      };
      this.itemsSubject.next([...currentItems, updatedItem]);

    } catch (error) {
      console.error('Error saving new item:', error);
      throw error;
    }
  }

  async refreshItems(): Promise<void> {
    await Promise.all([
      this.loadItems(),
      this.loadFoodItems()
    ]);
  }
}