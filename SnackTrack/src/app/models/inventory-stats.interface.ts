import { StorageLocation } from './storage-location.interface';

export interface InventoryStatsInterface {
  totalItems: number;
  expiringSoonCount: number;
  itemsByLocation: { [locationId: string]: number };
  mostUsedLocation: StorageLocation | null;
}
