import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';

import { InventoryService } from '../../services/inventory.service';
import { StorageLocationService } from '../../services/storage-location.service';
import { ItemService } from '../../services/item.service';
import { AddItemModalComponent } from '../../components/modals/add-item-modal/add-item-modal.component';
import { Inventory } from '../../models/inventory.interface';
import { Item } from '../../models/item.interface';
import { StorageLocation } from '../../models/storage-location.interface';
import { combineLatest } from 'rxjs';

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
  inventoryId: string;
  name: string;
  unit: string;
  count: number;
  img?: string | null;
  badge?: string;
  isExpired?: boolean;
  locationId?: string;
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

  selectedLocationId!: string;
  private sub?: Subscription;

  constructor(
    private inventory: InventoryService,
    private storageLocationService: StorageLocationService,
    private itemService: ItemService,
    private modalController: ModalController
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
    this.sub = combineLatest([
      this.inventory.inventory$,
      this.itemService.items$,
      this.storageLocationService.storageLocations$
    ]).subscribe(([invList, itemList, locList]) => {
      this.items = itemList;
      this.locations = locList;

      this.inventoryCards = this.sortInventoryCards(
        invList.map(inv => this.toCard(inv))
      );

      const saved = localStorage.getItem('lastSelectedLocation');
      const savedId = saved ? saved.trim() : null;

      const exists = savedId ? this.locations.find(loc => loc.location_id === savedId) : null;

      if (exists) {
        this.selectedLocationId = exists.location_id;
      } else if (this.locations.length > 0) {
        this.selectedLocationId = this.locations[0].location_id;
        localStorage.setItem('lastSelectedLocation', this.selectedLocationId);
      }

      this.applyLocationFilter();
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
      locationId: inv.location_id,
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
  item.count += 1;
  await this.inventory.updateFoodItemQuantity(item.inventoryId, item.count);
  this.filter;
}

  async decrement(item: InventoryCardItem) {
    if (item.count > 1) {
      item.count -= 1;
      await this.inventory.updateFoodItemQuantity(item.inventoryId, item.count);
    } else {
      this.inventoryCards = this.inventoryCards.filter(i => i.inventoryId !== item.inventoryId);
      await this.inventory.deleteInventoryItem(item.inventoryId);
    }
  }

  // startRename(item: InventoryCardItem) {
  //   this.editingId = item.id;
  //   this.editName = item.name;
  // }

  // cancelRename() {
  //   this.editingId = null;
  //   this.editName = '';
  // }

  // async saveRename(item: InventoryCardItem) {
  //   console.warn('Rename functionality disabled: Item names come from master data');
  //   this.cancelRename();
  //}

  trackById(_index: number, item: InventoryCardItem) {
    return item.id;
  }

  async openAddItemModal() {
    const modal = await this.modalController.create({
      component: AddItemModalComponent,
      componentProps: {
        isEdit: false,
        storageLocations: this.storageLocationService.getStorageLocations(),
      },
    });

    await modal.present();
  }

  sortInventoryCards(invCards: any[]): any[] {
    if (!Array.isArray(invCards)) {
        console.error('sortInventoryCards erwartet ein Array!');
        return [];
    }

    const safeCards = invCards.map(card => ({
        ...card,
        inventoryId: card.inventoryId ?? 0
    }));

    safeCards.sort((a, b) => {
        const idA = typeof a.inventoryId === 'number' ? a.inventoryId : Number(a.inventoryId);
        const idB = typeof b.inventoryId === 'number' ? b.inventoryId : Number(b.inventoryId);
        return idA - idB;
    });

    return safeCards;
  }

  onLocationChange() {
    localStorage.setItem('lastSelectedLocation', this.selectedLocationId);
    this.applyLocationFilter(); 
  };

  applyLocationFilter() {
    if (!this.selectedLocationId) return;

    this.filteredCards = this.inventoryCards.filter( card => card.locationId === this.selectedLocationId);
  };
}