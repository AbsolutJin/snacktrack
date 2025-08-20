import { FoodCategoryInterface } from './food-category.interface';
import { StorageLocationInterface } from './storage-location.interface';

export interface FoodItemInterface {
  id: string;
  name: string;
  category: FoodCategoryInterface;
  quantity: number;
  unit: string;
  storageLocation: StorageLocationInterface;
  expiryDate: Date;
  addedDate: Date;
  isExpiringSoon?: boolean;
}
