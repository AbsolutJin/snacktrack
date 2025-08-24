import { FoodCategoryInterface } from './food-category.interface';
import { StorageLocationInterface } from './storage-location.interface';

export enum FoodUnit {
  Gram = "g",
  Kilogram = "kg",
  Liter = "l",
  Piece = "Stk",
}

export interface FoodItemInterface {
  id: string;
  name: string;
  category: FoodCategoryInterface;
  quantity: number;
  unit: FoodUnit;
  storageLocation: StorageLocationInterface;
  expiryDate: Date;
  addedDate: Date;
  isExpiringSoon?: boolean;
}
