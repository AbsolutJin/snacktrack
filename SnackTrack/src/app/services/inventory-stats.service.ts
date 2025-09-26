import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FoodItemInterface } from '../models/food-item.interface';
import { StorageLocation } from '../models/storage-location.interface';
import { InventoryStatsInterface } from '../models/inventory-stats.interface';
import { SupabaseClientService } from './supabase-client.service';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryStatsService {

  constructor(
    private supabaseClient: SupabaseClientService,
    private itemService: ItemService
  ) {}

  getExpiringSoonItems(daysThreshold: number = 7): Observable<FoodItemInterface[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    return this.itemService.foodItems$.pipe(
      map((items) =>
        items
          .filter((item) => item.expiryDate <= threshold)
          .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
          .map((item) => ({ ...item, isExpiringSoon: true }))
      )
    );
  }

  async getExpiringItems(daysThreshold: number = 7, limit?: number): Promise<any[]> {
    try {
      const currentDate = new Date();
      const thresholdDate = new Date();
      thresholdDate.setDate(currentDate.getDate() + daysThreshold);

      const { data, error } = await this.supabaseClient.client
        .from('inventory')
        .select(`
          *,
          items (
            product_name,
            brand,
            image_url
          ),
          storage_locations (
            name
          )
        `)
        .lte('expiration_date', thresholdDate.toISOString().split('T')[0])
        .order('expiration_date', { ascending: true });

      if (error) {
        console.error('Error fetching expiring items:', error);
        return [];
      }

      const expiringItems = (data || []).map(item => ({
        id: item.inventory_id,
        name: item.items?.product_name || 'Unbekanntes Produkt',
        brand: item.items?.brand || '',
        quantity: item.quantity,
        unit: 'Stk',
        expiryDate: new Date(item.expiration_date),
        storageLocation: {
          location_id: item.location_id,
          name: item.storage_locations?.name || 'Unbekannt'
        },
        notes: item.notes,
        image_url: item.items?.image_url,
        isExpiringSoon: true,
        addedDate: new Date(item.last_update || Date.now())
      }));

      return limit ? expiringItems.slice(0, limit) : expiringItems;

    } catch (error) {
      console.error('Error in getExpiringItems:', error);
      return [];
    }
  }

  async getInventoryStats(): Promise<InventoryStatsInterface> {
    try {
      const { data: inventoryData, error: inventoryError } = await this.supabaseClient.client
        .from('inventory')
        .select(`
          *,
          storage_locations (
            location_id,
            name
          )
        `);

      if (inventoryError) {
        console.error('Error fetching inventory stats:', inventoryError);
        return {
          totalItems: 0,
          expiringSoonCount: 0,
          itemsByLocation: {},
          mostUsedLocation: null
        };
      }

      const items = inventoryData || [];
      const itemsByLocation: { [locationId: string]: number } = {};
      let expiringSoonCount = 0;

      const threshold = new Date();
      threshold.setDate(threshold.getDate() + 7);

      items.forEach((item) => {
        const locationId = item.location_id;
        if (locationId) {
          itemsByLocation[locationId] = (itemsByLocation[locationId] || 0) + item.quantity;
        }

        const expiryDate = new Date(item.expiration_date);
        if (expiryDate <= threshold) {
          expiringSoonCount++;
        }
      });

      let mostUsedLocation = null;

      if (Object.keys(itemsByLocation).length > 0) {
        const mostUsedLocationId = Object.keys(itemsByLocation).reduce(
          (a, b) => (itemsByLocation[a] > itemsByLocation[b] ? a : b)
        );

        const { data: locationData, error: locationError } = await this.supabaseClient.client
          .from('storage_locations')
          .select('location_id, name')
          .eq('location_id', mostUsedLocationId)
          .single();

        if (!locationError && locationData) {
          mostUsedLocation = {
            location_id: locationData.location_id,
            name: locationData.name
          } as StorageLocation;
        } else {
          console.error('Failed to load storage location:', locationError);
        }
      }

      return {
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        expiringSoonCount,
        itemsByLocation,
        mostUsedLocation
      };

    } catch (error) {
      console.error('Error in getInventoryStats:', error);
      return {
        totalItems: 0,
        expiringSoonCount: 0,
        itemsByLocation: {},
        mostUsedLocation: null
      };
    }
  }
}