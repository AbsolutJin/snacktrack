import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { InventoryStatsInterface } from 'src/app/models/inventory-stats.interface';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { StorageLocationService } from '../../services/storage-location.service';
import { InventoryStatsService } from '../../services/inventory-stats.service';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  analyticsOutline,
  warningOutline,
  cubeOutline,
  albumsOutline,
  pieChartOutline,
  alertCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-inventory-chart',
  standalone: true,
  templateUrl: './inventory-chart.component.html',
  styleUrl: './inventory-chart.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ...IONIC_COMPONENTS
  ],
})
export class InventoryChartComponent implements OnInit, OnDestroy {
  inventoryStats: InventoryStatsInterface = {
    totalItems: 0,
    expiringSoonCount: 0,
    itemsByLocation: {},
    mostUsedLocation: null
  };
  storageLocations: StorageLocation[] = [];
  isLoading = true;
  hasError = false;
  private destroy$ = new Subject<void>();

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
      alertCircleOutline,
    });
  }

  async ngOnInit() {
    this.storageLocationService.storageLocations$
      .pipe(takeUntil(this.destroy$))
      .subscribe(locations => {
        this.storageLocations = locations;
      });

    await this.loadInventoryStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async loadInventoryStats() {
    try {
      this.isLoading = true;
      this.hasError = false;
      this.inventoryStats = await this.inventoryStatsService.getInventoryStats();
    } catch (error) {
      console.error('Error loading inventory stats:', error);
      this.hasError = true;
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
