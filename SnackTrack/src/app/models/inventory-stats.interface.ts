import { FoodCategoryInterface } from './food-category.interface';
import { StorageLocation } from './storage-location.interface';

export interface InventoryStatsInterface {
  totalItems: number;
  expiringSoonCount: number;
  itemsByLocation: { [locationId: string]: number };
  itemsByCategory: { [categoryId: string]: number };
  mostUsedLocation: StorageLocation;
  mostUsedCategory: FoodCategoryInterface;
}
