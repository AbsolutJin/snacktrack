import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { InventoryService } from '../../services/inventory.service';
import { FoodItemInterface } from '../../models/food-item.interface';
import { Inventory } from '../../models/inventory.interface';
import { Item } from '../../models/item.interface';
import { StorageLocation } from '../../models/storage-location.interface';

// Ionicons: ensure icons render even without CDN
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

interface InventoryCardItem {
  id: string;
  name: string;
  unit: string;
  count: number;
  img?: string | null;
  badge?: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})
export class InventoryPage implements OnInit, OnDestroy {
  showSearch = false;
  query = '';
  activeFilters: string[] = [];

  inventoryCards: InventoryCardItem[] = [];
  filteredCards: InventoryCardItem[] = [];
  items: Item[] = [];
  locations: StorageLocation[] = [];

  // rename state
  editingId: string | null = null;
  editName = '';

  private sub?: Subscription;

  constructor(private inventory: InventoryService) {
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
        this.inventory.items$.subscribe((itemList) => {
          this.items = itemList;
          this.inventory.storageLocations$.subscribe((locList: import('../../models/storage-location.interface').StorageLocation[]) => {
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

  // map backend model → UI card model
  private toCard(inv: Inventory): InventoryCardItem {
    const item = this.items.find(i => i.barcode === inv.barcode);
    const location = this.locations.find(l => l.location_id === inv.location_id);
    // Find the matching food item by barcode or inventory id
    // Try to find food item by barcode
    const foodItem = this.inventory.getFoodItems().find(fi => fi.id === inv.barcode);
    return {
      id: foodItem?.id ?? inv.inventory_id,
      name: item?.product_name ?? inv.barcode,
      unit: item?.brand ?? '',
      count: inv.quantity,
      img: item?.image_url ?? null,
      badge: inv.expiration_date ? `Ablauf: ${inv.expiration_date}` : undefined,
    };
  }

  // UI Aktionen
  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) this.clearSearch();
  }

  clearSearch() {
    this.query = '';
    this.filter();
  }

  openFilters() {
    // optional: open modal/sheet for filters
  }

  // Datenlogik
  filter() {
    const q = this.query.trim().toLowerCase();
    this.filteredCards = !q
      ? [...this.inventoryCards]
      : this.inventoryCards.filter((i) => (i.name || '').toLowerCase().includes(q));
  }

  async increment(item: InventoryCardItem) {
    await this.inventory.updateFoodItemQuantity(item.id, item.count + 1);
    await this.inventory.loadInventory();
    this.filter();
  }

  async decrement(item: InventoryCardItem) {
    if (item.count > 1) {
      await this.inventory.updateFoodItemQuantity(item.id, item.count - 1);
    } else {
      await this.inventory.deleteFoodItem(item.id);
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
    const newName = this.editName.trim();
    if (newName && newName !== item.name) {
      await this.inventory.renameFoodItem(item.id, newName);
    }
    this.cancelRename();
  }

  trackById(_index: number, item: InventoryCardItem) {
    return item.id;
  }
}