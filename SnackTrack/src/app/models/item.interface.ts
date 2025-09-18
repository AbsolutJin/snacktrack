export interface Item {
  barcode: string;
  product_name: string;
  brand: string;
  quantity: number;
  image_url?: string;
  last_fetched_at: string;
}
