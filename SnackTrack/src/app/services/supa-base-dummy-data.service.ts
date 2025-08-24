import { Injectable } from '@angular/core';
import { StorageLocationInterface } from '../models/storage-location.interface';
import { FoodCategoryInterface } from '../models/food-category.interface';
import { FoodItemInterface } from '../models/food-item.interface';

@Injectable({
  providedIn: 'root'
})
export class SupabaseDummyService {

  constructor() {
    console.log('⚠️ SupabaseService läuft im DUMMY-Modus. Backend-Aufrufe sind noch nicht implementiert.');
  }

  // ------------------------
  // Storage Locations CRUD
  // ------------------------

  async getStorageLocations(): Promise<StorageLocationInterface[]> {
    // TODO: Backend-Implementierung
    return [
      { id: '1', name: 'Kühlschrank', color: 'warning' },
      { id: '2', name: 'Gefrierschrank', color: 'danger' }
    ];
  }

  async createStorageLocation(location: Omit<StorageLocationInterface, 'id'>): Promise<StorageLocationInterface> {
    // TODO: Backend-Implementierung
    return { id: 'dummy-storage-id', ...location };
  }

  async updateStorageLocation(id: string, location: StorageLocationInterface): Promise<StorageLocationInterface> {
    // TODO: Backend-Implementierung
    return { ...location, id };
  }

  async deleteStorageLocation(id: string): Promise<void> {
    // TODO: Backend-Implementierung
    console.log('Dummy deleteStorageLocation:', id);
  }

  // ------------------------
  // Categories CRUD
  // ------------------------

  async getCategories(): Promise<FoodCategoryInterface[]> {
    // TODO: Backend-Implementierung
    return [
      { id: '1', name: 'Obst', icon: '', color: 'danger' },
      { id: '2', name: 'Getränke', icon: '', color: 'warning' }
    ];
  }

  async createCategory(category: Omit<FoodCategoryInterface, 'id'>): Promise<FoodCategoryInterface> {
    // TODO: Backend-Implementierung
    return { id: 'dummy-category-id', ...category };
  }

  async updateCategory(id: string, category: FoodCategoryInterface): Promise<FoodCategoryInterface> {
    // TODO: Backend-Implementierung
    return { ...category, id };
  }

  async deleteCategory(id: string): Promise<void> {
    // TODO: Backend-Implementierung
    console.log('Dummy deleteCategory:', id);
  }

  // ------------------------
  // Food Items CRUD
  // ------------------------

async getFoodItems(): Promise<FoodItemInterface[]> {
  const storageLocations = await this.getStorageLocations();
  const categories = await this.getCategories();

  const fridge = storageLocations.find(s => s.name === 'Kühlschrank')!;
  const freezer = storageLocations.find(s => s.name === 'Gefrierschrank')!;
  const fruits = categories.find(c => c.name === 'Obst')!;
  const drinks = categories.find(c => c.name === 'Getränke')!;

  return [
    {
      id: 'f1',
      name: 'Milch',
      quantity: 1,
      unit: 'l',
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      addedDate: new Date(),
      storageLocation: fridge,
      category: drinks
    },
    {
      id: 'f2',
      name: 'Äpfel',
      quantity: 6,
      unit: 'Stk',
      expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      addedDate: new Date(),
      storageLocation: fridge,
      category: fruits
    },
    {
      id: 'f3',
      name: 'Bananen',
      quantity: 4,
      unit: 'Stk',
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      addedDate: new Date(),
      storageLocation: fridge,
      category: fruits
    },
    {
      id: 'f4',
      name: 'Eiswürfel',
      quantity: 1,
      unit: 'Beutel',
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      addedDate: new Date(),
      storageLocation: freezer,
      category: drinks
    },
    {
      id: 'f5',
      name: 'Orangen',
      quantity: 8,
      unit: 'Stk',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      addedDate: new Date(),
      storageLocation: fridge,
      category: fruits
    }
  ];
}


  async createFoodItem(item: Omit<FoodItemInterface, 'id'>): Promise<FoodItemInterface> {
    // TODO: Backend-Implementierung
    return { ...item, id: 'dummy-food-id' };
  }

  async updateFoodItem(id: string, item: FoodItemInterface): Promise<FoodItemInterface> {
    // TODO: Backend-Implementierung
    return { ...item, id };
  }

  async deleteFoodItem(id: string): Promise<void> {
    // TODO: Backend-Implementierung
    console.log('Dummy deleteFoodItem:', id);
  }

  // ------------------------
  // Real-time Subscriptions (nur im Backend relevant)
  // ------------------------

  subscribeToStorageLocations(callback: (payload: any) => void) {
    // TODO: Backend-Implementierung
    console.log('Dummy subscribeToStorageLocations');
    return { unsubscribe: () => {} };
  }

  subscribeToCategories(callback: (payload: any) => void) {
    // TODO: Backend-Implementierung
    console.log('Dummy subscribeToCategories');
    return { unsubscribe: () => {} };
  }

  subscribeToFoodItems(callback: (payload: any) => void) {
    // TODO: Backend-Implementierung
    console.log('Dummy subscribeToFoodItems');
    return { unsubscribe: () => {} };
  }
}
