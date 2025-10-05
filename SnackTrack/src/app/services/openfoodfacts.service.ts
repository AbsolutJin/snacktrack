import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';


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
  private readonly baseUrl = 'https://world.openfoodfacts.org/api/v2/product';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json'
    });
  }

  getProductByBarcode(barcode: string): Observable<ProductInfo | null> {
    if (!barcode || barcode.trim().length === 0) {
      return of(null);
    }

    const cleanBarcode = barcode.trim();
    const headers = this.getHeaders();

    return this.http.get<any>(
      `${this.baseUrl}/${cleanBarcode}`,
      { headers }
    ).pipe(
      map(response => {
        if (response.status === 1 && response.product) {
          const product = response.product;
          return {
            barcode: cleanBarcode,
            product_name: product.product_name_de || product.product_name_en || product.product_name || 'Unbekanntes Produkt',
            brand: product.brands ? product.brands.split(',')[0].trim() : '',
            quantity: product.quantity || '',
            image_url: product.image_front_small_url || product.image_front_url || product.image_url || null
          };
        }
        return null;
      }),
      catchError(error => {
        console.error('Fehler beim Abrufen des Produkts von OpenFoodFacts:', error);
        if (error.status === 429) {
          console.warn('Request Limit erreicht');
        }
        return of(null);
      })
    );
  }

}
