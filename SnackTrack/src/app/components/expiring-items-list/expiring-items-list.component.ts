// src/app/components/expiring-items-list/expiring-items-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Observable } from 'rxjs';
import { FoodItemInterface } from '../../models/food-item.interface';
import { InventoryService } from '../../services/inventory.service';
import { checkmarkCircleOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-expiring-items-list',
  standalone: true,
  templateUrl: './expiring-items-list.component.html',
  styleUrl: './expiring-items-list.component.scss',
  imports: [CommonModule, IonicModule],
})
export class ExpiringItemsListComponent implements OnInit {
  expiringSoonItems$!: Observable<FoodItemInterface[]>;

  constructor(private inventoryService: InventoryService) {
    addIcons({
      checkmarkCircleOutline,
    });
  }

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
