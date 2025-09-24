// src/app/components/inventory-chart/inventory-chart.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { InventoryStatsInterface } from 'src/app/models/inventory-stats.interface';
import { StorageLocation } from 'src/app/models/storage-location.interface';
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
  // Categories entfernt - nur noch Locations verfügbar

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


  getStorageLocations(): StorageLocation[] {
    return this.inventoryService.getStorageLocations();
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
