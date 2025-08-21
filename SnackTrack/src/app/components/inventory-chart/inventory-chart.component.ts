// src/app/components/inventory-chart/inventory-chart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { InventoryStatsInterface } from 'src/app/models/inventory-stats.interface';
import { StorageLocationInterface } from 'src/app/models/storage-location.interface';
import { FoodCategoryInterface } from 'src/app/models/food-category.interface';
import { InventoryService } from '../../services/inventory.service';
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
  inventoryStats$!: Observable<InventoryStatsInterface>;
  selectedSegment: string = 'locations';

  constructor(private inventoryService: InventoryService) {
    addIcons({
      homeOutline,
      analyticsOutline,
      warningOutline,
      cubeOutline,
      albumsOutline,
      pieChartOutline,
    });
  }

  ngOnInit() {
    this.inventoryStats$ = this.inventoryService.getInventoryStats();
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  getStorageLocations(): StorageLocationInterface[] {
    return this.inventoryService.getStorageLocations();
  }

  getCategories(): FoodCategoryInterface[] {
    return this.inventoryService.getCategories();
  }

  getProgress(current: number, total: number): number {
    return total > 0 ? current / total : 0;
  }

  getPercentage(current: number, total: number): number {
    return total > 0 ? Math.round((current / total) * 100) : 0;
  }

  trackByLocationId(index: number, location: StorageLocationInterface): string {
    return location.id;
  }

  trackByCategoryId(index: number, category: FoodCategoryInterface): string {
    return category.id;
  }
}
