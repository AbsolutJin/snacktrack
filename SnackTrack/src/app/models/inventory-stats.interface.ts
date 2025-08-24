import { FoodCategoryInterface } from './food-category.interface';
import { StorageLocationInterface } from './storage-location.interface';

export interface InventoryStatsInterface {
  totalItems: number;
  expiringSoonCount: number;
  itemsByLocation: { [locationId: string]: number };
  itemsByCategory: { [categoryId: string]: number };
  mostUsedLocation: StorageLocationInterface | null;
  mostUsedCategory: FoodCategoryInterface | null;
}
