// src/app/components/inventory-stats/inventory-stats.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { InventoryStatsInterface } from 'src/app/models/inventory-stats.interface';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-inventory-stats',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './inventory-stats.component.html',
  styleUrls: ['./inventory-stats.component.scss'],
})
export class InventoryStatsComponent implements OnInit {
  inventoryStats$!: Observable<InventoryStatsInterface>;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.inventoryStats$ = this.inventoryService.getInventoryStats();
  }

  getStorageLocations() {
    return this.inventoryService.getStorageLocations();
  }

  getCategories() {
    return this.inventoryService.getCategories();
  }

  trackByLocationId(index: number, location: any) {
    return location.id;
  }

  trackByCategoryId(index: number, category: any) {
    return category.id;
  }
}
