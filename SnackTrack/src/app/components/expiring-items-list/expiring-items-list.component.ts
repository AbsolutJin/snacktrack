// src/app/components/expiring-items-list/expiring-items-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { InventoryStatsService } from '../../services/inventory-stats.service';
import { InventoryService } from '../../services/inventory.service';
import { Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';
import { checkmarkCircleOutline, warningOutline, calendarOutline, chevronUp, chevronDown, warning, time, locationOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-expiring-items-list',
  standalone: true,
  templateUrl: './expiring-items-list.component.html',
  styleUrl: './expiring-items-list.component.scss',
  imports: [
    CommonModule,
    ...IONIC_COMPONENTS
  ],
})
export class ExpiringItemsListComponent implements OnInit, OnDestroy {
  expiringItems: any[] = [];
  displayItems: any[] = [];
  showMore = false;
  isLoading = true;
  readonly itemLimit = 5;
  private destroy$ = new Subject<void>();

  constructor(
    private inventoryStatsService: InventoryStatsService,
    private inventoryService: InventoryService
    ,private router: Router
    ,private toastService: ToastService
  ) {
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

  ngOnInit() {
    this.inventoryService.inventory$
      .pipe(takeUntil(this.destroy$))
      .subscribe(async () => {
        await this.loadExpiringItems();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    // Fast ablaufend (1-2 Tage) should be highlighted as warning (gelb) instead of danger (rot)
    if (daysLeft <= 2) return 'warning';
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

  openInInventory(item: any) {
    // Navigate to the inventory tab; include inventory id as query param for future highlighting
    const params: any = {};
    if (item.id) params.inventoryId = item.id;
    // include storage location id if available so inventory can preselect the correct location
    if (item.storageLocation && item.storageLocation.location_id) {
      params.locationId = item.storageLocation.location_id;
    }
  console.log('Navigating to /tabs/kitchen with params', params);
    this.router.navigate(['/tabs/kitchen'], { queryParams: params }).then(navigated => {
      if (navigated) {
        // show a clearer bottom-positioned toast with location and item name (if available)
        const locName = item.storageLocation?.name ? `Lagerort: ${item.storageLocation.name}` : '';
        const itemName = item.name ? `Artikel: ${item.name}` : '';
        const messageParts = ['Wechsle zum Inventar', locName, itemName].filter(Boolean).join(' — ');
  this.toastService.showCustom(messageParts, 'success', 'middle', 3000);
      } else {
        // fallback attempt
        try {
          this.router.navigateByUrl('/tabs/kitchen').then(() => this.toastService.success('Gehe zum Inventar...'));
        } catch (err) {
          console.error('Navigation fehlgeschlagen', err);
          this.toastService.error('Konnte nicht zum Inventar navigieren');
        }
      }
    }).catch(err => {
      console.error('Navigation fehlerhaft', err);
      this.toastService.error('Konnte nicht zum Inventar navigieren');
    });
  }
}
