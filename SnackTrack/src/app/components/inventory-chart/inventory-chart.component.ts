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

@Component({
  selector: 'app-inventory-chart',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          <ion-icon name="analytics-outline" color="tertiary"></ion-icon>
          Inventar-Visualisierung
        </ion-card-title>
      </ion-card-header>

      <ion-card-content>
        <!-- Segment zur Auswahl -->
        <ion-segment
          [(ngModel)]="selectedSegment"
          (ionChange)="onSegmentChange($event)"
        >
          <ion-segment-button value="locations">
            <ion-label>Lagerplätze</ion-label>
            <ion-icon name="home-outline"></ion-icon>
          </ion-segment-button>
          <ion-segment-button value="categories">
            <ion-label>Kategorien</ion-label>
            <ion-icon name="albums-outline"></ion-icon>
          </ion-segment-button>
        </ion-segment>

        <div class="chart-container" *ngIf="inventoryStats$ | async as stats">
          <!-- Lagerplätze Chart -->
          <div *ngIf="selectedSegment === 'locations'" class="chart-section">
            <h3>Verteilung nach Lagerplätzen</h3>
            <div class="progress-chart">
              <div
                *ngFor="
                  let location of getStorageLocations();
                  trackBy: trackByLocationId
                "
                class="progress-item"
              >
                <div class="progress-header">
                  <div class="progress-label">
                    <ion-icon
                      [name]="location.icon"
                      [color]="location.color"
                    ></ion-icon>
                    <span>{{ location.name }}</span>
                  </div>
                  <div class="progress-value">
                    {{ stats.itemsByLocation[location.id] || 0 }} /
                    {{ stats.totalItems }}
                    <small
                      >({{
                        getPercentage(
                          stats.itemsByLocation[location.id] || 0,
                          stats.totalItems
                        )
                      }}%)</small
                    >
                  </div>
                </div>
                <ion-progress-bar
                  [value]="
                    getProgress(
                      stats.itemsByLocation[location.id] || 0,
                      stats.totalItems
                    )
                  "
                  [color]="location.color"
                >
                </ion-progress-bar>
              </div>
            </div>
          </div>

          <!-- Kategorien Chart -->
          <div *ngIf="selectedSegment === 'categories'" class="chart-section">
            <h3>Verteilung nach Kategorien</h3>
            <div class="progress-chart">
              <div
                *ngFor="
                  let category of getCategories();
                  trackBy: trackByCategoryId
                "
                class="progress-item"
              >
                <div class="progress-header">
                  <div class="progress-label">
                    <ion-icon
                      [name]="category.icon"
                      [color]="category.color"
                    ></ion-icon>
                    <span>{{ category.name }}</span>
                  </div>
                  <div class="progress-value">
                    {{ stats.itemsByCategory[category.id] || 0 }} /
                    {{ stats.totalItems }}
                    <small
                      >({{
                        getPercentage(
                          stats.itemsByCategory[category.id] || 0,
                          stats.totalItems
                        )
                      }}%)</small
                    >
                  </div>
                </div>
                <ion-progress-bar
                  [value]="
                    getProgress(
                      stats.itemsByCategory[category.id] || 0,
                      stats.totalItems
                    )
                  "
                  [color]="category.color"
                >
                </ion-progress-bar>
              </div>
            </div>
          </div>

          <!-- Zusammenfassung -->
          <div class="chart-summary">
            <ion-chip color="primary" outline="true">
              <ion-icon name="pie-chart-outline"></ion-icon>
              <ion-label>Gesamt: {{ stats.totalItems }} Artikel</ion-label>
            </ion-chip>

            <ion-chip
              color="warning"
              outline="true"
              *ngIf="stats.expiringSoonCount > 0"
            >
              <ion-icon name="warning-outline"></ion-icon>
              <ion-label
                >{{ stats.expiringSoonCount }} bald ablaufend</ion-label
              >
            </ion-chip>
          </div>
        </div>
      </ion-card-content>
    </ion-card>
  `,
})
export class InventoryChartComponent implements OnInit {
  inventoryStats$!: Observable<InventoryStatsInterface>;
  selectedSegment: string = 'locations';

  constructor(private inventoryService: InventoryService) {}

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
