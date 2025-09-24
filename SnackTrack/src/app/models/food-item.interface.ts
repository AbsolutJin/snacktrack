import { StorageLocation } from './storage-location.interface';

export enum FoodUnit {
  Gram = "g",
  Kilogram = "kg",
  Liter = "l",
  Piece = "Stk",
}

export interface FoodItemInterface {
  id: string;
  name: string;
  quantity: number;
  unit: FoodUnit;
  storageLocation: StorageLocation;
  expiryDate: Date;
  addedDate: Date;
  isExpiringSoon?: boolean;
}
