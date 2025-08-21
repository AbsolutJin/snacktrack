import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { FoodItemInterface } from '../models/food-item.interface';
import { StorageLocationInterface } from '../models/storage-location.interface';
import { FoodCategoryInterface } from '../models/food-category.interface';
import { InventoryStatsInterface } from '../models/inventory-stats.interface';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private foodItemsSubject = new BehaviorSubject<FoodItemInterface[]>([]);
  public foodItems$ = this.foodItemsSubject.asObservable();

  private storageLocations: StorageLocationInterface[] = [
    { id: '1', name: 'Kühlschrank', icon: '', color: 'primary' },
    {
      id: '2',
      name: 'Gefrierschrank',
      icon: 'ice-cream-outline',
      color: 'secondary',
    },
    { id: '3', name: 'Vorratskammer', icon: '', color: 'tertiary' },
    { id: '4', name: 'Gewürzregal', icon: '', color: 'success' },
  ];

  private categories: FoodCategoryInterface[] = [
    { id: '1', name: 'Gemüse', icon: '', color: 'success' },
    { id: '2', name: 'Fleisch', icon: '', color: 'danger' },
    { id: '3', name: 'Milchprodukte', icon: '', color: 'warning' },
    { id: '4', name: 'Getränke', icon: '', color: 'primary' },
    { id: '5', name: 'Backwaren', icon: '', color: 'medium' },
    { id: '6', name: 'Konserven', icon: '', color: 'dark' },
  ];

  constructor() {
    this.loadDummyData();
  }

  private loadDummyData(): void {
    const dummyData: FoodItemInterface[] = [
      {
        id: '1',
        name: 'Milch',
        category: this.categories[2],
        quantity: 1,
        unit: 'Liter',
        storageLocation: this.storageLocations[0],
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 Tage
        addedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Hähnchenbrust',
        category: this.categories[1],
        quantity: 500,
        unit: 'g',
        storageLocation: this.storageLocations[0],
        expiryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 Tag
        addedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: '3',
        name: 'Brot',
        category: this.categories[4],
        quantity: 1,
        unit: 'Stück',
        storageLocation: this.storageLocations[2],
        expiryDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 Tage
        addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        name: 'Tiefkühlpizza',
        category: this.categories[4],
        quantity: 2,
        unit: 'Stück',
        storageLocation: this.storageLocations[1],
        expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 Monate
        addedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        id: '5',
        name: 'Karotten',
        category: this.categories[0],
        quantity: 1,
        unit: 'kg',
        storageLocation: this.storageLocations[0],
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 Tage
        addedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        id: '6',
        name: 'Joghurt',
        category: this.categories[2],
        quantity: 4,
        unit: 'Becher',
        storageLocation: this.storageLocations[0],
        expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 Tage
        addedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: '7',
        name: 'Reis',
        category: this.categories[5],
        quantity: 2,
        unit: 'kg',
        storageLocation: this.storageLocations[2],
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 Jahr
        addedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: '8',
        name: 'Bananen',
        category: this.categories[0],
        quantity: 6,
        unit: 'Stück',
        storageLocation: this.storageLocations[2],
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 Tage
        addedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ];

    this.foodItemsSubject.next(dummyData);
  }

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
          // Count by location
          itemsByLocation[item.storageLocation.id] =
            (itemsByLocation[item.storageLocation.id] || 0) + 1;

          // Count by category
          itemsByCategory[item.category.id] =
            (itemsByCategory[item.category.id] || 0) + 1;

          // Count expiring soon
          if (item.expiryDate <= threshold) {
            expiringSoonCount++;
          }
        });

        // Find most used location and category
        const mostUsedLocationId = Object.keys(itemsByLocation).reduce(
          (a, b) => (itemsByLocation[a] > itemsByLocation[b] ? a : b),
          '1'
        );
        const mostUsedCategoryId = Object.keys(itemsByCategory).reduce(
          (a, b) => (itemsByCategory[a] > itemsByCategory[b] ? a : b),
          '1'
        );

        return {
          totalItems: items.length,
          expiringSoonCount,
          itemsByLocation,
          itemsByCategory,
          mostUsedLocation: this.storageLocations.find(
            (loc) => loc.id === mostUsedLocationId
          )!,
          mostUsedCategory: this.categories.find(
            (cat) => cat.id === mostUsedCategoryId
          )!,
        };
      })
    );
  }

  getStorageLocations(): StorageLocationInterface[] {
    return [...this.storageLocations];
  }

  getCategories(): FoodCategoryInterface[] {
    return [...this.categories];
  }
}
