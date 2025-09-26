import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    brands?: string;
    quantity?: string;
    image_url?: string;
    image_front_url?: string;
  };
  status: number;
  status_verbose: string;
}

export interface ProductInfo {
  barcode: string;
  product_name: string;
  brand: string;
  quantity: string;
  image_url: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class OpenFoodFactsService {
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v0/product';

  constructor(private http: HttpClient) {}

  getProductByBarcode(barcode: string): Observable<ProductInfo | null> {
    return this.http.get<OpenFoodFactsProduct>(`${this.baseUrl}/${barcode}.json`).pipe(
      map(response => {
        if (response.status === 1 && response.product) {
          const product = response.product;
          return {
            barcode: barcode,
            product_name: product.product_name || 'Unbekanntes Produkt',
            brand: product.brands || '',
            quantity: product.quantity || '',
            image_url: product.image_front_url || product.image_url || null
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Error fetching product from OpenFoodFacts:', error);
        throw error;
      })
    );
  }
}