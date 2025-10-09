export interface Inventory {
  inventory_id: string;
  user_id: string;
  location_id: number;
  barcode: string;
  quantity: number;
  expiration_date?: string | null;
  notes?: string;
  last_update: string;
}
