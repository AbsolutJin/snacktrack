import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, firstValueFrom, catchError, of } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { FoodItemInterface } from '../models/food-item.interface';
import { Inventory } from '../models/inventory.interface';
import { StorageLocation } from '../models/storage-location.interface';
import { Item } from '../models/item.interface';
import { InventoryStatsInterface } from '../models/inventory-stats.interface';
import { StorageLocationModalComponent } from '../components/modals/storage-location-modal/storage-location-modal.component';
import { SupabaseClientService } from './supabase-client.service';
import { StorageLocationService } from './storage-location.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  public getFoodItems(): FoodItemInterface[] {
    return this.foodItemsSubject.value;
  }
  private inventorySubject = new BehaviorSubject<Inventory[]>([]);
  public inventory$ = this.inventorySubject.asObservable();

  private itemsSubject = new BehaviorSubject<Item[]>([]);
  public items$ = this.itemsSubject.asObservable();
  private foodItemsSubject = new BehaviorSubject<FoodItemInterface[]>([]);
  public foodItems$ = this.foodItemsSubject.asObservable();

  // BehaviorSubjects für reactive Updates
  private storageLocationsSubject = new BehaviorSubject<StorageLocation[]>([]);

  // Observables für reactive Updates
  public storageLocations$ = this.storageLocationsSubject.asObservable();

  // Loading States
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(
    private supabaseClient: SupabaseClientService,
    private storageLocationService: StorageLocationService
  ) {
    // Subscribe to changes from specialized services first
    this.storageLocationService.storageLocations$.subscribe(locations => {
      this.storageLocationsSubject.next(locations);
    });

    this.loadInventory();
    this.loadItems();
    this.initializeData();
  }

  //Initialisiert alle Daten beim Service-Start
  /** Lädt alle Inventar-Einträge aus der Tabelle 'inventory' */
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

  /** Lädt alle Lagerorte aus der Tabelle 'storage_locations' */
  // Entfernt: loadLocations(). Nur noch loadStorageLocations() verwenden.

  /** Lädt alle Items aus der Tabelle 'items' */
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
  private async initializeData(): Promise<void> {
    this.isLoadingSubject.next(true);
    
    try {
      // Parallel laden für bessere Performance
      await Promise.all([
        this.storageLocationService.loadStorageLocations(),
        this.loadFoodItems()
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      // Setze leere Arrays bei Fehler
      this.storageLocationsSubject.next([]);
      this.foodItemsSubject.next([]);
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  /** Update only the quantity of an Inventory Item */
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

  /** Rename a Food Item (update its name) */
  async renameFoodItem(id: string, name: string): Promise<void> {
    try {
      const current = this.foodItemsSubject.value;
      const foodItem = current.find((fi) => fi.id === id);
      if (!foodItem) throw new Error('Food item not found');

      const updatedFoodItem: FoodItemInterface = {
        ...foodItem,
        name
      };

      const { data, error } = await this.supabaseClient.client
        .from('food_items')
        .update({
          name: updatedFoodItem.name,
          quantity: updatedFoodItem.quantity,
          unit: updatedFoodItem.unit,
          expiry_date: updatedFoodItem.expiryDate.toISOString(),
          storage_location_id: updatedFoodItem.storageLocation.location_id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          storage_location:storage_locations(*)
        `)
        .single();
      
      if (error) {
        console.error('Fehler beim Aktualisieren des Food Items:', error);
        throw error;
      }

      const updated = current.map((fi) => (fi.id === id ? updatedFoodItem : fi));
      this.foodItemsSubject.next(updated);
    } catch (error) {
      console.error('Fehler beim Umbenennen des Artikels:', error);
      throw error;
    }
  }

  /** Delete a Food Item completely */
  async deleteFoodItem(id: string): Promise<void> {
    try {
      const { error } = await this.supabaseClient.client
        .from('food_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Fehler beim Löschen des Food Items:', error);
        throw error;
      }
      const current = this.foodItemsSubject.value;
      this.foodItemsSubject.next(current.filter((fi) => fi.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Artikels:', error);
      throw error;
    }
  }


  //Lädt Food Items vom Backend
  private async loadFoodItems(): Promise<void> {
    try {
      const { data, error } = await this.supabaseClient.client
        .from('items')
        .select('*');

      if (error) {
        console.error('Fehler beim Laden der Food Items:', error);
        throw error;
      }

      // Einfache Mapping da keine Relationen mehr
      const foodItems = data || [];

      this.foodItemsSubject.next(foodItems);
    } catch (error) {
      console.error('Fehler beim Laden der Food Items:', error);
      throw error;
    }
  }


  // CRUD Lagerort mit Backend-Integration
  getStorageLocations(): StorageLocation[] {
    return this.storageLocationService.getStorageLocations();
  }

  async addStorageLocation(location: Omit<StorageLocation, 'location_id'>): Promise<StorageLocation> {
    return await this.storageLocationService.createStorageLocation(location);
  }

  async updateStorageLocation(id: string, location: StorageLocation): Promise<void> {
    const updatedLocation = await this.storageLocationService.updateStorageLocation(id, location);
    this.updateFoodItemsStorageLocation(id, updatedLocation);
  }

  async deleteStorageLocation(id: string): Promise<void> {
    // Prüfen ob Items in diesem Lagerort existieren
    const currentFoodItems = this.foodItemsSubject.value;
    const hasItemsInLocation = currentFoodItems.some(item => item.storageLocation.location_id === id);
    
    if (hasItemsInLocation) {
      throw new Error('Dieser Lagerort kann nicht gelöscht werden, da noch Artikel darin gespeichert sind.');
    }

    await this.storageLocationService.deleteStorageLocation(id);
  }


  //Refresh-Methode für manuelle Aktualisierung
  async refreshData(): Promise<void> {
    await this.initializeData();
  }

  // Modal Methoden
  async openAddModal(
    modalController: ModalController
  ): Promise<{ success: boolean }> {
    const modal = await modalController.create({
      component: StorageLocationModalComponent,
      componentProps: { isEdit: false },
    });

    await modal.present();
    const result = await modal.onDidDismiss();

    if (result.data) {
      try {
        await this.addStorageLocation(result.data);
        return { success: true };
      } catch (error) {
        console.error('Fehler beim Hinzufügen:', error);
        throw error;
      }
    }

    return { success: false }; // Modal geschlossen ohne Hinzufügen
  }

  async openEditModal(
    item: StorageLocation,
    modalController: ModalController
  ): Promise<{ success: boolean }> {
    const modal = await modalController.create({
      component: StorageLocationModalComponent,
      componentProps: {
        isEdit: true,
        item: { ...item },
      },
    });

    await modal.present();
    const result = await modal.onDidDismiss();
    
    if (result.data) {
      try {
        const updatedItem = { ...item, ...result.data };
        await this.updateStorageLocation(item.location_id, updatedItem);
        return {success: true};
      } catch (error) {
        console.error('Fehler beim Aktualisieren:', error);
        throw error;
      }
    }
    
    return { success: false };
  }

  async openDeleteConfirmation(
    item: StorageLocation,
    alertController: AlertController
  ): Promise<{success: boolean}> {
    return new Promise<{success: boolean}>(async (resolve, reject) => {
      const alert = await alertController.create({
        header: 'Lagerort löschen',
        message: `Möchten Sie "${item.name}" wirklich löschen?`,
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
            handler: () => resolve({success: false}),
          },
          {
            text: 'Löschen',
            role: 'destructive',
            handler: async () => {
              try {
                await this.deleteStorageLocation(item.location_id);
                resolve({success: true});
              } catch (error) {
                console.error('Fehler beim Löschen:', error);
                reject(error);
              }
            },
          },
        ],
      });

      await alert.present();
    });
  }

  // Helper Methoden
  private updateFoodItemsStorageLocation(locationId: string, updatedLocation: StorageLocation): void {
    const currentFoodItems = this.foodItemsSubject.value;
    const updatedFoodItems = currentFoodItems.map(item => 
      item.storageLocation.location_id === locationId
        ? { ...item, storageLocation: updatedLocation }
        : item
    );
    this.foodItemsSubject.next(updatedFoodItems);
  }

  // Stat Methoden
  getExpiringSoonItems(daysThreshold: number = 7): Observable<FoodItemInterface[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return this.foodItems$.pipe(
      map((items) =>
        items
          .filter((item) => item.expiryDate <= threshold)
          .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
          .map((item) => ({ ...item, isExpiringSoon: true }))
      )
    );
  }

  getInventoryStats(): Observable<InventoryStatsInterface> {
    return this.foodItems$.pipe(
      map((items) => {
        const itemsByLocation: { [locationId: string]: number } = {};
        let expiringSoonCount = 0;

        const threshold = new Date();
        threshold.setDate(threshold.getDate() + 7);

        items.forEach((item) => {
          if (item.storageLocation?.location_id) {
            itemsByLocation[item.storageLocation.location_id] =
              (itemsByLocation[item.storageLocation.location_id] || 0) + 1;
          }

          if (item.expiryDate <= threshold) {
            expiringSoonCount++;
          }
        });

        const currentStorageLocations = this.storageLocationsSubject.value;

        if (currentStorageLocations.length === 0) {
          return {
            totalItems: items.length,
            expiringSoonCount,
            itemsByLocation,
            mostUsedLocation: null,
          };
        }

        const mostUsedLocationId = Object.keys(itemsByLocation).reduce(
          (a, b) => (itemsByLocation[a] > itemsByLocation[b] ? a : b),
          currentStorageLocations[0].location_id
        );

        return {
          totalItems: items.length,
          expiringSoonCount,
          itemsByLocation,
          mostUsedLocation:
            currentStorageLocations.find((loc) => loc.location_id === mostUsedLocationId) ||
            currentStorageLocations[0],
        };
      })
    );
  }
}