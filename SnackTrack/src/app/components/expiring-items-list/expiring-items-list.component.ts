// src/app/components/expiring-items-list/expiring-items-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FoodItemInterface } from '../../models/food-item.interface';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-expiring-items-list',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-card>
      <ion-card-header>
        <ion-card-title>
          <ion-icon name="warning-outline" color="warning"></ion-icon>
          Bald ablaufende Lebensmittel
        </ion-card-title>
        <ion-card-subtitle>Innerhalb der nächsten 7 Tage</ion-card-subtitle>
      </ion-card-header>

      <ion-card-content>
        <ion-list *ngIf="expiringSoonItems$ | async as items">
          <div *ngIf="items.length === 0" class="no-items">
            <ion-icon
              name="checkmark-circle-outline"
              color="success"
              size="large"
            ></ion-icon>
            <p>Keine bald ablaufenden Lebensmittel!</p>
          </div>

          <ion-item *ngFor="let item of items" [color]="getItemColor(item)">
            <ion-icon
              [name]="item.storageLocation.icon"
              [color]="item.storageLocation.color"
              slot="start"
            >
            </ion-icon>

            <ion-label>
              <h2>{{ item.name }}</h2>
              <p>
                {{ item.quantity }} {{ item.unit }} - {{ item.category.name }}
              </p>
              <p class="expiry-info">
                <ion-icon name="calendar-outline" size="small"></ion-icon>
                Läuft ab am: {{ item.expiryDate | date : 'dd.MM.yyyy' }}
                <span class="days-left"
                  >({{ getDaysLeft(item.expiryDate) }})</span
                >
              </p>
            </ion-label>

            <ion-badge slot="end" [color]="getBadgeColor(item)">
              {{ getDaysLeft(item.expiryDate) }}
            </ion-badge>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .no-items {
        text-align: center;
        padding: 2rem 0;
        color: var(--ion-color-medium);
      }

      .no-items ion-icon {
        margin-bottom: 1rem;
      }

      .expiry-info {
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.25rem;
      }

      .days-left {
        font-weight: 600;
        margin-left: 0.25rem;
      }

      ion-item[color='danger'] {
        --background: var(--ion-color-danger-tint);
        --color: var(--ion-color-danger-contrast);
      }

      ion-item[color='warning'] {
        --background: var(--ion-color-warning-tint);
        --color: var(--ion-color-warning-contrast);
      }

      ion-card-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    `,
  ],
})
export class ExpiringItemsListComponent implements OnInit {
  expiringSoonItems$!: Observable<FoodItemInterface[]>;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.expiringSoonItems$ = this.inventoryService.getExpiringSoonItems(7);
  }

  getDaysLeft(expiryDate: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} Tag(e) abgelaufen`;
    } else if (diffDays === 0) {
      return 'Heute ablaufend';
    } else if (diffDays === 1) {
      return 'Morgen ablaufend';
    } else {
      return `${diffDays} Tage übrig`;
    }
  }

  getBadgeColor(item: FoodItemInterface): string {
    const daysLeft = this.getDaysLeftNumber(item.expiryDate);

    if (daysLeft <= 0) return 'danger';
    if (daysLeft <= 2) return 'danger';
    if (daysLeft <= 5) return 'warning';
    return 'medium';
  }

  getItemColor(item: FoodItemInterface): string {
    const daysLeft = this.getDaysLeftNumber(item.expiryDate);

    if (daysLeft <= 0) return 'danger';
    if (daysLeft <= 2) return 'danger';
    if (daysLeft <= 5) return 'warning';
    return '';
  }

  private getDaysLeftNumber(expiryDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
