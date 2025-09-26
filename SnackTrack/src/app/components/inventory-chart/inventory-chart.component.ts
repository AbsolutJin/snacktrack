// src/app/components/inventory-chart/inventory-chart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { InventoryStatsInterface } from 'src/app/models/inventory-stats.interface';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { StorageLocationService } from '../../services/storage-location.service';
import { InventoryStatsService } from '../../services/inventory-stats.service';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  analyticsOutline,
  warningOutline,
  cubeOutline,
  albumsOutline,
  pieChartOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-inventory-chart',
  standalone: true,
  templateUrl: './inventory-chart.component.html',
  styleUrl: './inventory-chart.component.scss',
  imports: [CommonModule, IonicModule, FormsModule],
})
export class InventoryChartComponent implements OnInit {
  inventoryStats: InventoryStatsInterface = {
    totalItems: 0,
    expiringSoonCount: 0,
    itemsByLocation: {},
    mostUsedLocation: null
  };
  storageLocations: StorageLocation[] = [];
  isLoading = true;

  constructor(
    private storageLocationService: StorageLocationService,
    private inventoryStatsService: InventoryStatsService
  ) {
    addIcons({
      homeOutline,
      analyticsOutline,
      warningOutline,
      cubeOutline,
      albumsOutline,
      pieChartOutline,
    });
  }

  async ngOnInit() {
    await this.loadInventoryStats();
  }

  async loadInventoryStats() {
    try {
      this.isLoading = true;
      this.inventoryStats = await this.inventoryStatsService.getInventoryStats();
      this.storageLocations = this.storageLocationService.getStorageLocations();
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    } finally {
      this.isLoading = false;
    }
  }


  getStorageLocations(): StorageLocation[] {
    return this.storageLocations;
  }


  getProgress(current: number, total: number): number {
    return total > 0 ? current / total : 0;
  }

  getPercentage(current: number, total: number): number {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }

  trackByLocationId(index: number, location: StorageLocation): string {
  return location.location_id;
  }

}
