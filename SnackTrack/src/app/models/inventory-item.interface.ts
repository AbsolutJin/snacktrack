export interface InventoryItem {
  inventory_id: number; // PK, auto-increment
  user_id: string; // FK
  location_id: string; // FK
  barcode: string; // FK
  quantity: number;
  expiration_date: string; // date
  notes?: string; // can be null
  last_update: string; // timestamp, automatic
}

export interface CreateInventoryItem {
  user_id: string;
  location_id: number;
  barcode: string;
  quantity: number;
  expiration_date: string;
  notes?: string;
}
