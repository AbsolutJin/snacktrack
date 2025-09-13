import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, firstValueFrom, catchError, of } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { FoodItemInterface } from '../models/food-item.interface';
import { Inventory } from '../models/inventory.interface';
import { StorageLocation } from '../models/storage-location.interface';
import { Item } from '../models/item.interface';
import { FoodCategoryInterface } from '../models/food-category.interface';
import { InventoryStatsInterface } from '../models/inventory-stats.interface';
import { StorageLocationModalComponent } from '../components/modals/storage-location-modal/storage-location-modal.component';
import { FoodCategoryModalComponent } from '../components/modals/food-category-modal/food-category-modal.component';
import { SupabaseService } from './supabase.service';

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
  private categoriesSubject = new BehaviorSubject<FoodCategoryInterface[]>([]);

  // Observables für reactive Updates
  public storageLocations$ = this.storageLocationsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();

  // Loading States
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {
  this.loadInventory();
  this.loadItems();
  this.loadStorageLocations();
  this.initializeData();
  }

  //Initialisiert alle Daten beim Service-Start
  /** Lädt alle Inventar-Einträge aus der Tabelle 'inventory' */
  async loadInventory(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.client
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
      const { data, error } = await this.supabaseService.client
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
        this.loadStorageLocations(),
        this.loadCategories(),
        this.loadFoodItems()
      ]);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      // Fallback zu Dummy-Daten bei Fehler
      this.loadFallbackData();
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

      await this.supabaseService.updateInventoryItem(id, updatedInventoryItem);

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

      await this.supabaseService.updateFoodItem(id, updatedFoodItem);

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
      await this.supabaseService.deleteFoodItem(id);
      const current = this.foodItemsSubject.value;
      this.foodItemsSubject.next(current.filter((fi) => fi.id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Artikels:', error);
      throw error;
    }
  }

  //Lädt Lagerorte vom Backend
  private async loadStorageLocations(): Promise<void> {
    try {
      const locations = await this.supabaseService.getStorageLocations();
      this.storageLocationsSubject.next(locations);
    } catch (error) {
      console.error('Fehler beim Laden der Lagerorte:', error);
      throw error;
    }
  }

  //Lädt Kategorien vom Backend
  private async loadCategories(): Promise<void> {
    try {
      const categories = await this.supabaseService.getCategories();
      this.categoriesSubject.next(categories);
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
      throw error;
    }
  }

  //Lädt Food Items vom Backend
  private async loadFoodItems(): Promise<void> {
    try {
      const foodItems = await this.supabaseService.getFoodItems();
      this.foodItemsSubject.next(foodItems);
    } catch (error) {
      console.error('Fehler beim Laden der Food Items:', error);
      throw error;
    }
  }

//Fallback-Daten bei Backend-Fehlern für Demo-Zwecke
  private loadFallbackData(): void {
  const fallbackLocations: StorageLocation[] = [
  { location_id: '1', name: 'Khlschrank', user_id: 'demo', created_at: new Date().toISOString() },
  { location_id: '2', name: 'Gefrierschrank', user_id: 'demo', created_at: new Date().toISOString() },
  { location_id: '3', name: 'Vorratskammer', user_id: 'demo', created_at: new Date().toISOString() },
  { location_id: '4', name: 'Gewrzregal', user_id: 'demo', created_at: new Date().toISOString() },
    ];

    const fallbackCategories: FoodCategoryInterface[] = [
      { id: '1', name: 'Gemüse', icon: 'nutrition-outline' },
      { id: '2', name: 'Fleisch', icon: 'restaurant-outline' },
      { id: '3', name: 'Milchprodukte', icon: 'water-outline' },
      { id: '4', name: 'Getränke', icon: 'wine-outline' },
      { id: '5', name: 'Backwaren', icon: 'leaf-outline' },
      { id: '6', name: 'Konserven', icon: 'apps-outline' },
    ];

    this.storageLocationsSubject.next(fallbackLocations);
    this.categoriesSubject.next(fallbackCategories);
    this.foodItemsSubject.next([]);
  }

  // CRUD Lagerort mit Backend-Integration
  getStorageLocations(): StorageLocation[] {
    return [...this.storageLocationsSubject.value];
  }

  async addStorageLocation(location: Omit<StorageLocation, 'location_id'>): Promise<StorageLocation> {
    try {
      // Backend-Aufruf
    const newLocation = await this.supabaseService.createStorageLocation(location as Omit<StorageLocation, 'location_id'>);
      
      // Lokalen State aktualisieren
      const currentLocations = this.storageLocationsSubject.value;
      const updatedLocations = [...currentLocations, newLocation];
      this.storageLocationsSubject.next(updatedLocations);
      
      return newLocation;
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Lagerorts:', error);
      throw error;
    }
  }

  async updateStorageLocation(id: string, location: StorageLocation): Promise<void> {
    try {
      // Backend-Aufruf
      const updatedLocation = await this.supabaseService.updateStorageLocation(id, location);
      
      // Lokalen State aktualisieren
      const currentLocations = this.storageLocationsSubject.value;
  const index = currentLocations.findIndex(s => s.location_id === id);
      
      if (index !== -1) {
        const updatedLocations = [...currentLocations];
        updatedLocations[index] = updatedLocation;
        this.storageLocationsSubject.next(updatedLocations);
        
        // Food Items mit diesem Lagerort aktualisieren
        this.updateFoodItemsStorageLocation(id, updatedLocation);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Lagerorts:', error);
      throw error;
    }
  }

  async deleteStorageLocation(id: string): Promise<void> {
    try {
      // Prüfen ob Items in diesem Lagerort existieren
      const currentFoodItems = this.foodItemsSubject.value;
    const hasItemsInLocation = currentFoodItems.some(item => item.storageLocation.location_id === id);
      
      if (hasItemsInLocation) {
        throw new Error('Dieser Lagerort kann nicht gelöscht werden, da noch Artikel darin gespeichert sind.');
      }

      // Backend-Aufruf
      await this.supabaseService.deleteStorageLocation(id);
      
      // Lokalen State aktualisieren
      const currentLocations = this.storageLocationsSubject.value;
  const updatedLocations = currentLocations.filter(s => s.location_id !== id);
      this.storageLocationsSubject.next(updatedLocations);
      
    } catch (error) {
      console.error('Fehler beim Löschen des Lagerorts:', error);
      throw error;
    }
  }

  // CRUD Kategorien mit Backend-Integration

  getCategories(): FoodCategoryInterface[] {
    return [...this.categoriesSubject.value];
  }

  async addCategory(category: Omit<FoodCategoryInterface, 'id'>): Promise<FoodCategoryInterface> {
    try {
      // Backend-Aufruf
      const newCategory = await this.supabaseService.createCategory(category);
      
      // Lokalen State aktualisieren
      const currentCategories = this.categoriesSubject.value;
      const updatedCategories = [...currentCategories, newCategory];
      this.categoriesSubject.next(updatedCategories);
      
      return newCategory;
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Kategorie:', error);
      throw error;
    }
  }

  async updateCategory(id: string, category: FoodCategoryInterface): Promise<void> {
    try {
      // Backend-Aufruf
      const updatedCategory = await this.supabaseService.updateCategory(id, category);
      
      // Lokalen State aktualisieren
      const currentCategories = this.categoriesSubject.value;
      const index = currentCategories.findIndex(c => c.id === id);
      
      if (index !== -1) {
        const updatedCategories = [...currentCategories];
        updatedCategories[index] = updatedCategory;
        this.categoriesSubject.next(updatedCategories);
        
        // Food Items mit dieser Kategorie aktualisieren
        this.updateFoodItemsCategory(id, updatedCategory);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Kategorie:', error);
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      // Prüfen ob Items in dieser Kategorie existieren
      const currentFoodItems = this.foodItemsSubject.value;
      const hasItemsInCategory = currentFoodItems.some(item => item.category.id === id);
      
      if (hasItemsInCategory) {
        throw new Error('Diese Kategorie kann nicht gelöscht werden, da noch Artikel in dieser Kategorie vorhanden sind.');
      }

      // Backend-Aufruf
      await this.supabaseService.deleteCategory(id);
      
      // Lokalen State aktualisieren
      const currentCategories = this.categoriesSubject.value;
      const updatedCategories = currentCategories.filter(c => c.id !== id);
      this.categoriesSubject.next(updatedCategories);
      
    } catch (error) {
      console.error('Fehler beim Löschen der Kategorie:', error);
      throw error;
    }
  }

  //Refresh-Methode für manuelle Aktualisierung
  async refreshData(): Promise<void> {
    await this.initializeData();
  }

  // Modal Methoden
async openAddModal(
  type: 'storage' | 'category',
  modalController: ModalController
): Promise<{ success: boolean }> {
  const component = type === 'storage' 
    ? StorageLocationModalComponent 
    : FoodCategoryModalComponent;

  const modal = await modalController.create({
    component: component,
    componentProps: { isEdit: false },
  });

  await modal.present();
  const result = await modal.onDidDismiss();

  if (result.data) {
    try {
      if (type === 'storage') {
        await this.addStorageLocation(result.data);
      } else {
        await this.addCategory(result.data);
      }
      return { success: true };
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      throw error;
    }
  }

  return { success: false }; // Modal geschlossen ohne Hinzufügen
}

  async openEditModal(
  item: StorageLocation | FoodCategoryInterface,
    type: 'storage' | 'category',
    modalController: ModalController
  ): Promise<{ success: boolean }> {
    const component = type === 'storage' 
      ? StorageLocationModalComponent 
      : FoodCategoryModalComponent;

    const modal = await modalController.create({
      component: component,
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
        
        if (type === 'storage') {
          if ('location_id' in item) {
            await this.updateStorageLocation(item.location_id, updatedItem);
          }
        } else {
          await this.updateCategory((item as FoodCategoryInterface).id, updatedItem as FoodCategoryInterface);
        }
        return {success: true};
      } catch (error) {
        console.error('Fehler beim Aktualisieren:', error);
        throw error;
      }
    }
    
    return { success: false };
  }

  async openDeleteConfirmation(
  item: StorageLocation | FoodCategoryInterface,
    type: 'storage' | 'category',
    alertController: AlertController
  ): Promise<{success: boolean}> {
    return new Promise<{success: boolean}>(async (resolve, reject) => {
      const itemTypeName = type === 'storage' ? 'Lagerort' : 'Kategorie';
      
      const alert = await alertController.create({
        header: `${itemTypeName} löschen`,
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
                if (type === 'storage') {
                  if ('location_id' in item) {
                    await this.deleteStorageLocation(item.location_id);
                  }
                } else {
                  await this.deleteCategory((item as FoodCategoryInterface).id);
                }
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

  private updateFoodItemsCategory(categoryId: string, updatedCategory: FoodCategoryInterface): void {
    const currentFoodItems = this.foodItemsSubject.value;
    const updatedFoodItems = currentFoodItems.map(item => 
      item.category.id === categoryId 
        ? { ...item, category: updatedCategory }
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
        const itemsByCategory: { [categoryId: string]: number } = {};
        let expiringSoonCount = 0;

        const threshold = new Date();
        threshold.setDate(threshold.getDate() + 7);

        items.forEach((item) => {
          itemsByLocation[item.storageLocation.location_id] =
            (itemsByLocation[item.storageLocation.location_id] || 0) + 1;

          itemsByCategory[item.category.id] =
            (itemsByCategory[item.category.id] || 0) + 1;

          if (item.expiryDate <= threshold) {
            expiringSoonCount++;
          }
        });

        const currentStorageLocations = this.storageLocationsSubject.value;
        const currentCategories = this.categoriesSubject.value;

        if (currentStorageLocations.length === 0 || currentCategories.length === 0) {
          return {
          totalItems: items.length,
          expiringSoonCount,
          itemsByLocation,
          itemsByCategory,
          mostUsedLocation: currentStorageLocations[0] ?? { id: 'fallback', name: 'Unbekannt' },
          mostUsedCategory: currentCategories[0] ?? { id: 'fallback', name: 'Unbekannt' },
          };
        }

      const mostUsedLocationId = Object.keys(itemsByLocation).reduce(
        (a, b) => (itemsByLocation[a] > itemsByLocation[b] ? a : b),
  currentStorageLocations[0].location_id
      );
      const mostUsedCategoryId = Object.keys(itemsByCategory).reduce(
        (a, b) => (itemsByCategory[a] > itemsByCategory[b] ? a : b),
        currentCategories[0].id
      );

        return {
          totalItems: items.length,
          expiringSoonCount,
          itemsByLocation,
          itemsByCategory,
        mostUsedLocation:
          currentStorageLocations.find((loc) => loc.location_id === mostUsedLocationId) ||
          currentStorageLocations[0],
        mostUsedCategory:
          currentCategories.find((cat) => cat.id === mostUsedCategoryId) ||
          currentCategories[0],
        };
      })
    );
  }
}