// src/app/components/expiring-items-list/expiring-items-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { InventoryStatsService } from '../../services/inventory-stats.service';
import { checkmarkCircleOutline, warningOutline, calendarOutline, chevronUp, chevronDown, warning, time, locationOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-expiring-items-list',
  standalone: true,
  templateUrl: './expiring-items-list.component.html',
  styleUrl: './expiring-items-list.component.scss',
  imports: [CommonModule, IonicModule],
})
export class ExpiringItemsListComponent implements OnInit {
  expiringItems: any[] = [];
  displayItems: any[] = [];
  showMore = false;
  isLoading = true;
  readonly itemLimit = 5;

  constructor(private inventoryStatsService: InventoryStatsService) {
    addIcons({
      checkmarkCircleOutline,
      warningOutline,
      calendarOutline,
      chevronUp,
      chevronDown,
      warning,
      time,
      locationOutline,
    });
  }

  async ngOnInit() {
    await this.loadExpiringItems();
  }

  async loadExpiringItems() {
    try {
      this.isLoading = true;
      this.expiringItems = await this.inventoryStatsService.getExpiringItems(7);
      this.updateDisplayItems();
    } catch (error) {
      console.error('Error loading expiring items:', error);
      this.expiringItems = [];
    } finally {
      this.isLoading = false;
    }
  }

  updateDisplayItems() {
    if (this.showMore) {
      this.displayItems = this.expiringItems;
    } else {
      this.displayItems = this.expiringItems.slice(0, this.itemLimit);
    }
  }

  toggleShowMore() {
    this.showMore = !this.showMore;
    this.updateDisplayItems();
  }

  get hasMoreItems(): boolean {
    return this.expiringItems.length > this.itemLimit;
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

  getBadgeColor(item: any): string {
    const daysLeft = this.getDaysLeftNumber(item.expiryDate);

    if (daysLeft <= 0) return 'danger';
    if (daysLeft <= 2) return 'danger';
    if (daysLeft <= 5) return 'warning';
    return 'medium';
  }

  getItemCssClass(item: any): string {
    const daysLeft = this.getDaysLeftNumber(item.expiryDate);

    if (daysLeft <= 0) return 'expiring-item critical';
    if (daysLeft <= 2) return 'expiring-item urgent';
    if (daysLeft <= 5) return 'expiring-item warning';
    return 'expiring-item';
  }

  getDaysLeftNumber(expiryDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
