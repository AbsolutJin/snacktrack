export interface Inventory {
  inventory_id: string;
  user_id: string;
  location_id: number;
  barcode: string;
  quantity: number;
  expiration_date: string;
  notes?: string;
  last_update: string;
}
