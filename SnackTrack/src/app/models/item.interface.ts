export interface Item {
  barcode: string; // PK
  product_name: string;
  brand: string;
  quantity: string; // varchar from OpenFoodFacts
  image_url: string | null;
  last_fetched: string; // timestamp
}
