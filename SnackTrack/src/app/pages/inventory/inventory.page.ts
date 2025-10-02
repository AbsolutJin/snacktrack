import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { InventoryService } from '../../services/inventory.service';
import { StorageLocationService } from '../../services/storage-location.service';
import { ItemService } from '../../services/item.service';
import { FoodItemInterface } from '../../models/food-item.interface';
import { Inventory } from '../../models/inventory.interface';
import { Item } from '../../models/item.interface';
import { StorageLocation } from '../../models/storage-location.interface';

import { addIcons } from 'ionicons';
import {
  filterOutline,
  addOutline,
  searchOutline,
  trashOutline,
  pencilOutline,
  saveOutline,
  closeOutline,
  cubeOutline,
  imageOutline,
  removeOutline,
} from 'ionicons/icons';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';

interface InventoryCardItem {
  id: string;
  inventoryId: string; // Always the inventory_id for database operations
  name: string;
  unit: string;
  count: number;
  img?: string | null;
  badge?: string;
  isExpired?: boolean;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  imports: [CommonModule, FormsModule, ...IONIC_COMPONENTS],
})
export class InventoryPage implements OnInit, OnDestroy {
  showSearch = false;
  query = '';
  activeFilters: string[] = [];

  inventoryCards: InventoryCardItem[] = [];
  filteredCards: InventoryCardItem[] = [];
  items: Item[] = [];
  locations: StorageLocation[] = [];

  editingId: string | null = null;
  editName = '';

  private sub?: Subscription;

  constructor(
    private inventory: InventoryService,
    private storageLocationService: StorageLocationService,
    private itemService: ItemService
  ) {
    addIcons({
      filterOutline,
      addOutline,
      searchOutline,
      trashOutline,
      pencilOutline,
      saveOutline,
      closeOutline,
      cubeOutline,
      imageOutline,
      removeOutline,
    });
  }

  ngOnInit(): void {
    this.sub = this.inventory.inventory$.subscribe((inventory) => {
      this.inventory.inventory$.subscribe((invList) => {
        this.itemService.items$.subscribe((itemList) => {
          this.items = itemList;
          this.storageLocationService.storageLocations$.subscribe((locList: StorageLocation[]) => {
            this.locations = locList;
            this.inventoryCards = invList.map((inv) => this.toCard(inv));
            this.filter();
          });
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private toCard(inv: Inventory): InventoryCardItem {
    const item = this.items.find(i => i.barcode === inv.barcode);
    const location = this.locations.find(l => l.location_id === inv.location_id);
    const foodItem = this.inventory.getFoodItems().find(fi => fi.id === inv.barcode);
    // determine if expired (expiration_date is expected as YYYY-MM-DD or ISO)
    let expired = false;
    if (inv.expiration_date) {
      const exp = new Date(inv.expiration_date);
      const today = new Date();
      exp.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      expired = exp < today;
    }
    return {
      id: foodItem?.id ?? inv.inventory_id,
      inventoryId: inv.inventory_id,
      name: item?.product_name ?? inv.barcode,
      unit: item?.brand ?? '',
      count: inv.quantity,
      img: item?.image_url ?? null,
      badge: inv.expiration_date ? `Ablauf: ${inv.expiration_date}` : undefined,
      isExpired: expired,
    };
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.clearSearch();
  }

  clearSearch() {
    this.query = '';
    this.filter();
  }

  openFilters() {
  }

  filter() {
    const q = this.query.trim().toLowerCase();
    this.filteredCards = !q
      ? [...this.inventoryCards]
      : this.inventoryCards.filter((i) => (i.name || '').toLowerCase().includes(q));
  }

  async increment(item: InventoryCardItem) {
    await this.inventory.updateFoodItemQuantity(item.inventoryId, item.count + 1);
    await this.inventory.loadInventory();
    this.filter();
  }

  async decrement(item: InventoryCardItem) {
    if (item.count > 1) {
      await this.inventory.updateFoodItemQuantity(item.inventoryId, item.count - 1);
    } else {
      await this.inventory.deleteInventoryItem(item.inventoryId);
    }
    await this.inventory.loadInventory();
    this.filter();
  }

  startRename(item: InventoryCardItem) {
    this.editingId = item.id;
    this.editName = item.name;
  }

  cancelRename() {
    this.editingId = null;
    this.editName = '';
  }

  async saveRename(item: InventoryCardItem) {
    console.warn('Rename functionality disabled: Item names come from master data');
    this.cancelRename();
  }

  trackById(_index: number, item: InventoryCardItem) {
    return item.id;
  }
}