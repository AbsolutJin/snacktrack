import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ModalController, AlertController } from '@ionic/angular';
import { FoodItemInterface } from '../models/food-item.interface';
import { StorageLocationInterface } from '../models/storage-location.interface';
import { FoodCategoryInterface } from '../models/food-category.interface';
import { InventoryStatsInterface } from '../models/inventory-stats.interface';
import { StorageLocationModalComponent } from '../components/modals/storage-location-modal/storage-location-modal.component';
import { FoodCategoryModalComponent } from '../components/modals/food-category-modal/food-category-modal.component';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private foodItemsSubject = new BehaviorSubject<FoodItemInterface[]>([]);
  public foodItems$ = this.foodItemsSubject.asObservable();

  // BehaviorSubjects für reactive Updates
  private storageLocationsSubject = new BehaviorSubject<StorageLocationInterface[]>([
    { id: '1', name: 'Kühlschrank', color: 'primary' },
    { id: '2', name: 'Gefrierschrank', color: 'secondary' },
    { id: '3', name: 'Vorratskammer', color: 'tertiary' },
    { id: '4', name: 'Gewürzregal', color: 'success' },
  ]);

  private categoriesSubject = new BehaviorSubject<FoodCategoryInterface[]>([
    { id: '1', name: 'Gemüse', icon: 'nutrition-outline', color: 'success' },
    { id: '2', name: 'Fleisch', icon: 'restaurant-outline', color: 'danger' },
    { id: '3', name: 'Milchprodukte', icon: 'water-outline', color: 'warning' },
    { id: '4', name: 'Getränke', icon: 'wine-outline', color: 'primary' },
    { id: '5', name: 'Backwaren', icon: 'leaf-outline', color: 'medium' },
    { id: '6', name: 'Konserven', icon: 'apps-outline', color: 'dark' },
  ]);

  // Observables für reactive Updates
  public storageLocations$ = this.storageLocationsSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    this.loadDummyData();
  }

  private loadDummyData(): void {
    const storageLocations = this.storageLocationsSubject.value;
    const categories = this.categoriesSubject.value;

    const dummyData: FoodItemInterface[] = [
      {
        id: '1',
        name: 'Milch',
        category: categories[2],
        quantity: 1,
        unit: 'Liter',
        storageLocation: storageLocations[0],
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Hähnchenbrust',
        category: categories[1],
        quantity: 500,
        unit: 'g',
        storageLocation: storageLocations[0],
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        name: 'Brot',
        category: categories[4],
        quantity: 1,
        unit: 'Stück',
        storageLocation: storageLocations[2],
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        name: 'Tiefkühlpizza',
        category: categories[4],
        quantity: 2,
        unit: 'Stück',
        storageLocation: storageLocations[1],
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: '5',
        name: 'Karotten',
        category: categories[0],
        quantity: 1,
        unit: 'kg',
        storageLocation: storageLocations[0],
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '6',
        name: 'Joghurt',
        category: categories[2],
        quantity: 4,
        unit: 'Becher',
        storageLocation: storageLocations[0],
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '7',
        name: 'Reis',
        category: categories[5],
        quantity: 2,
        unit: 'kg',
        storageLocation: storageLocations[2],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: '8',
        name: 'Bananen',
        category: categories[0],
        quantity: 6,
        unit: 'Stück',
        storageLocation: storageLocations[2],
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    this.foodItemsSubject.next(dummyData);
  }

  //CRUD Lagerort

  getStorageLocations(): StorageLocationInterface[] {
    return [...this.storageLocationsSubject.value];
  }

  addStorageLocation(location: Omit<StorageLocationInterface, 'id'>): StorageLocationInterface {
    const newLocation: StorageLocationInterface = {
      id: this.generateId(),
      ...location
    };
    
    const currentLocations = this.storageLocationsSubject.value;
    const updatedLocations = [...currentLocations, newLocation];
    
    this.storageLocationsSubject.next(updatedLocations);
    this.saveToStorage('storageLocations', updatedLocations);
    
    return newLocation;
  }

  updateStorageLocation(id: string, location: StorageLocationInterface): void {
    const currentLocations = this.storageLocationsSubject.value;
    const index = currentLocations.findIndex(s => s.id === id);
    
    if (index !== -1) {
      const updatedLocations = [...currentLocations];
      updatedLocations[index] = { ...location, id };
      
      this.storageLocationsSubject.next(updatedLocations);
      this.saveToStorage('storageLocations', updatedLocations);
      
      // Alle Items mit diesem Lagerort aktualisieren
      this.updateFoodItemsStorageLocation(id, updatedLocations[index]);
    }
  }

  deleteStorageLocation(id: string): void {
    const currentLocations = this.storageLocationsSubject.value;
    const updatedLocations = currentLocations.filter(s => s.id !== id);
    
    // // Check ob Artikel in diesem Lager existieren
    const currentFoodItems = this.foodItemsSubject.value;
    const hasItemsInLocation = currentFoodItems.some(item => item.storageLocation.id === id);
    
    if (hasItemsInLocation) {
      throw new Error('Diese Lagerorte kann nicht gelöscht werden, da noch Artikel darin gespeichert sind.');
    }
    
    this.storageLocationsSubject.next(updatedLocations);
    this.saveToStorage('storageLocations', updatedLocations);
  }

  //CRUD Essenkategorie

  getCategories(): FoodCategoryInterface[] {
    return [...this.categoriesSubject.value];
  }

  addCategory(category: Omit<FoodCategoryInterface, 'id'>): FoodCategoryInterface {
    const newCategory: FoodCategoryInterface = {
      id: this.generateId(),
      ...category
    };
    
    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = [...currentCategories, newCategory];
    
    this.categoriesSubject.next(updatedCategories);
    this.saveToStorage('categories', updatedCategories);
    
    return newCategory;
  }

  updateCategory(id: string, category: FoodCategoryInterface): void {
    const currentCategories = this.categoriesSubject.value;
    const index = currentCategories.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const updatedCategories = [...currentCategories];
      updatedCategories[index] = { ...category, id };
      
      this.categoriesSubject.next(updatedCategories);
      this.saveToStorage('categories', updatedCategories);
      
      // Alle Items mit dieser Kategorie aktualisieren
      this.updateFoodItemsCategory(id, updatedCategories[index]);
    }
  }

  deleteCategory(id: string): void {
    const currentCategories = this.categoriesSubject.value;
    const updatedCategories = currentCategories.filter(c => c.id !== id);
    
    // Check ob Artikel in dieser Kategorie existieren
    const currentFoodItems = this.foodItemsSubject.value;
    const hasItemsInCategory = currentFoodItems.some(item => item.category.id === id);
    
    if (hasItemsInCategory) {
      throw new Error('Diese Kategorie kann nicht gelöscht werden, da noch Artikel in dieser Kategorie vorhanden sind.');
    }
    
    this.categoriesSubject.next(updatedCategories);
    this.saveToStorage('categories', updatedCategories);
  }

  //Modal Methoden

async openAddModal(type: 'storage' | 'category', modalController: ModalController): Promise<boolean> {
  const component = type === 'storage' 
    ? StorageLocationModalComponent 
    : FoodCategoryModalComponent;

  const modal = await modalController.create({
    component: component,
    componentProps: {
      isEdit: false,
    },
  });

  // Modal präsentieren
  await modal.present();

  // Auf das Dismiss warten
  const result = await modal.onDidDismiss();
  
  if (result.data) {
    try {
      if (type === 'storage') {
        this.addStorageLocation(result.data);
      } else {
        this.addCategory(result.data);
      }
      return true; // Erfolgreich hinzugefügt
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      throw error; // TODO: Fehler weiterleiten für Toast-Behandlung
    }
  }
  
  return false; // Nichts hinzugefügt
}

async openEditModal(
  item: StorageLocationInterface | FoodCategoryInterface,
  type: 'storage' | 'category',
  modalController: ModalController
): Promise<void> {
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
        this.updateStorageLocation(item.id, updatedItem);
      } else {
        this.updateCategory(item.id, updatedItem as FoodCategoryInterface);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren:', error);
      throw error; // TODO: Fehler weiterleiten für Toast-Behandlung
    }
  }
}

async openDeleteConfirmation(
  item: StorageLocationInterface | FoodCategoryInterface,
  type: 'storage' | 'category',
  alertController: AlertController
): Promise<boolean> {
  return new Promise<boolean>(async (resolve, reject) => {
    const itemTypeName = type === 'storage' ? 'Lagerort' : 'Kategorie';
    
    const alert = await alertController.create({
      header: `${itemTypeName} löschen`,
      message: `Möchten Sie "${item.name}" wirklich löschen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
          handler: () => {
            resolve(false); // Nicht gelöscht (abgebrochen)
          }
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            try {
              if (type === 'storage') {
                this.deleteStorageLocation(item.id);
              } else {
                this.deleteCategory(item.id);
              }
              resolve(true); // Erfolgreich gelöscht
            } catch (error) {
              console.error('Fehler beim Löschen:', error);
              reject(error); // TODO: Fehler weiterleiten für Toast-Behandlung
            }
          },
        },
      ],
    });

    await alert.present();
  });
}

  // Helper Methoden
  private updateFoodItemsStorageLocation(locationId: string, updatedLocation: StorageLocationInterface): void {
    const currentFoodItems = this.foodItemsSubject.value;
    const updatedFoodItems = currentFoodItems.map(item => 
      item.storageLocation.id === locationId 
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

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private saveToStorage(key: string, data: any): void {
    // localStorage ist in Browser-Umgebung verfügbar
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error(`Fehler beim Laden von ${key}:`, error);
        }
      }
    }
    return defaultValue;
  }


  //Stat Methoden
  getExpiringSoonItems(
    daysThreshold: number = 7
  ): Observable<FoodItemInterface[]> {
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
          itemsByLocation[item.storageLocation.id] =
            (itemsByLocation[item.storageLocation.id] || 0) + 1;

          itemsByCategory[item.category.id] =
            (itemsByCategory[item.category.id] || 0) + 1;

          if (item.expiryDate <= threshold) {
            expiringSoonCount++;
          }
        });

        const currentStorageLocations = this.storageLocationsSubject.value;
        const currentCategories = this.categoriesSubject.value;

        const mostUsedLocationId = Object.keys(itemsByLocation).reduce(
          (a, b) => (itemsByLocation[a] > itemsByLocation[b] ? a : b),
          currentStorageLocations[0]?.id || '1'
        );
        const mostUsedCategoryId = Object.keys(itemsByCategory).reduce(
          (a, b) => (itemsByCategory[a] > itemsByCategory[b] ? a : b),
          currentCategories[0]?.id || '1'
        );

        return {
          totalItems: items.length,
          expiringSoonCount,
          itemsByLocation,
          itemsByCategory,
          mostUsedLocation: currentStorageLocations.find(
            (loc) => loc.id === mostUsedLocationId
          )!,
          mostUsedCategory: currentCategories.find(
            (cat) => cat.id === mostUsedCategoryId
          )!,
        };
      })
    );
  }
}