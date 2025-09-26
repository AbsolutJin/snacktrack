import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Inventory } from '../models/inventory.interface';
import { CreateInventoryItem } from '../models/inventory-item.interface';
import { SupabaseClientService } from './supabase-client.service';
import { StorageLocationService } from './storage-location.service';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private inventorySubject = new BehaviorSubject<Inventory[]>([]);
  public inventory$ = this.inventorySubject.asObservable();

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private supabaseClient: SupabaseClientService,
    private storageLocationService: StorageLocationService,
    private itemService: ItemService
  ) {
    this.loadInventory();
    this.initializeData();
  }

  async loadInventory(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.client
        .from('inventory')
        .select('*');
      if (error) throw error;
      this.inventorySubject.next(data || []);
    } catch (err) {
      console.error('Fehler beim Laden des Inventars:', err);
      this.inventorySubject.next([]);
    }
  }

  private async initializeData(): Promise<void> {
    this.isLoadingSubject.next(true);

    try {
      await Promise.all([
        this.storageLocationService.loadStorageLocations(),
        this.itemService.refreshItems()
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  async updateFoodItemQuantity(id: string, quantity: number): Promise<void> {
    try {
      // Find inventory item by inventory_id
      const current = this.inventorySubject.value;
      const inventoryItem = current.find((inv) => inv.inventory_id === id);
      if (!inventoryItem) throw new Error('Inventory item not found');

      const updatedInventoryItem: Inventory = {
        ...inventoryItem,
        inventory_id: String(inventoryItem.inventory_id),
        quantity
      };

      const { data, error } = await this.supabaseClient.client
        .from('inventory')
        .update(updatedInventoryItem)
        .eq('inventory_id', id)
        .select();

      if (error) {
        console.error('Fehler beim Aktualisieren des Inventars:', error);
        throw error;
      }

      // Local state update
      const updated = current.map((inv) => (inv.inventory_id === id ? updatedInventoryItem : inv));
      this.inventorySubject.next(updated);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Menge:', error);
      throw error;
    }
  }

  async deleteInventoryItem(inventoryId: string): Promise<void> {
    try {
      const { error, status } = await this.supabaseClient.client
        .from('inventory')
        .delete()
        .eq('inventory_id', inventoryId);

      if (error) {
        console.error('Fehler beim Löschen des Inventory Items:', error);
        throw error;
      }

      // Remove from local inventory list
      const currentInventory = this.inventorySubject.value;
      this.inventorySubject.next(currentInventory.filter((inv) => inv.inventory_id !== inventoryId));

      console.log('Local state updated - item removed from inventory list');
    } catch (error) {
      console.error('Fehler beim Löschen des Artikels:', error);
      throw error;
    }
  }

  async canDeleteStorageLocation(id: string): Promise<boolean> {
    const { data, error } = await this.supabaseClient.client
      .from('inventory')
      .select('inventory_id')
      .eq('location_id', id)
      .limit(1);

    if (error) {
      console.error('Fehler beim Prüfen der Lagerort-Verwendung:', error);
      throw new Error('Fehler beim Prüfen der Lagerort-Verwendung.');
    }

    return !(data && data.length > 0);
  }

  async refreshData(): Promise<void> {
    await this.initializeData();
  }

  async getItemByBarcode(barcode: string) {
    return this.itemService.getItemByBarcode(barcode);
  }

  async saveNewItem(product: any): Promise<void> {
    return this.itemService.saveNewItem(product);
  }

  getFoodItems() {
    return this.itemService.getFoodItems();
  }

  async createInventoryItem(inventoryItem: CreateInventoryItem): Promise<void> {
    try {
      const { error } = await this.supabaseClient.client
        .from('inventory')
        .insert([inventoryItem]);

      if (error) {
        throw error;
      }

      // Reload inventory to reflect changes
      await this.loadInventory();

    } catch (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
  }
}