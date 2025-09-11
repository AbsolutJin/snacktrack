import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Subscription } from 'rxjs';

import { InventoryService } from '../../services/inventory.service';
import { FoodItemInterface } from '../../models/food-item.interface';

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
} from 'ionicons/icons';

interface InventoryCardItem {
  id: string;
  name: string;
  unit: string;
  count: number;
  img?: string | null;
  badge?: string;
  categoryIcon?: string;
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

  items: InventoryCardItem[] = [];
  filteredItems: InventoryCardItem[] = [];

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
    });
  }

  ngOnInit(): void {
    this.sub = this.inventory.foodItems$.subscribe((items) => {
      this.items = items.map((it) => this.toCard(it));
      this.filter();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // map backend model → UI card model
  private toCard(it: FoodItemInterface): InventoryCardItem {
    const anyIt: any = it as any; // tolerate slightly different field names
    return {
      id: (anyIt.id ?? anyIt.uuid ?? anyIt._id) as string,
      name: anyIt.name ?? '',
      unit: anyIt.unit ?? anyIt.packageUnit ?? '',
      count: anyIt.quantity ?? anyIt.count ?? 1,
      img: anyIt.imageUrl ?? anyIt.img ?? null,
      badge: anyIt.isExpiringSoon ? '⚠️' : undefined,
      categoryIcon: anyIt.category?.icon ?? 'cube-outline',
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
    this.filteredItems = !q
      ? [...this.items]
      : this.items.filter((i) => (i.name || '').toLowerCase().includes(q));
  }

  async increment(item: InventoryCardItem) {
    await this.inventory.updateFoodItemQuantity(item.id, item.count + 1);
  }

  async decrement(item: InventoryCardItem) {
    if (item.count > 1) {
      await this.inventory.updateFoodItemQuantity(item.id, item.count - 1);
    } else {
      await this.inventory.deleteFoodItem(item.id);
    }
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