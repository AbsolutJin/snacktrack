import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
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
import { Router, ActivatedRoute } from '@angular/router';
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
  infiniteOutline,
  alertCircleOutline,
} from 'ionicons/icons';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';

interface InventoryCardItem {
  id: string;
  inventoryId: string;
  name: string;
  brand: string;
  quantity: string;
  count: number;
  img?: string | null;
  badge?: string;
  isExpired?: boolean;
  isExpiringSoon?: boolean;
  locationId?: number;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  imports: [CommonModule, FormsModule, ...IONIC_COMPONENTS],
  providers: [DatePipe]
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
  editingExpiry: string | null = null; // YYYY-MM-DD

  selectedLocationId!: number;
  private sub?: Subscription;
  private pendingQueryParams: any = null;

  constructor(
    private inventory: InventoryService,
    private storageLocationService: StorageLocationService,
    private itemService: ItemService,
    private modalController: ModalController,
    private datePipe: DatePipe
    ,private route: ActivatedRoute
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
      alertCircleOutline
    });
  }

  ngOnInit(): void {
    // subscribe to query params; if data already loaded, apply immediately, else store pending
    this.route.queryParams.subscribe(params => {
      this.pendingQueryParams = params || null;
      this.applyQueryParamsIfReady();
    });

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
      const savedId = saved !== null ? Number(saved) : null;

      const exists = savedId !== null ? this.locations.find(loc => Number(loc.location_id) === savedId): null;

      if (exists) {
        this.selectedLocationId = exists.location_id;
      } else if (this.locations.length > 0) {
        this.selectedLocationId = this.locations[0].location_id;
        const selectedLocationId = this.selectedLocationId.toString();
        localStorage.setItem('lastSelectedLocation', selectedLocationId);
      }

      this.applyLocationFilter();
      // try to apply any pending query params now that data arrived
      this.applyQueryParamsIfReady();
    });
  }

  private applyQueryParamsIfReady() {
    if (!this.pendingQueryParams) return;
    // only apply if locations have been loaded
    if (!this.locations || this.locations.length === 0) return;

    const loc = this.pendingQueryParams['locationId'];
    const inventoryId = this.pendingQueryParams['inventoryId'];
    if (loc) {
      const asNum = Number(loc);
      const exists = this.locations.find(l => Number(l.location_id) === asNum);
      if (exists) {
        this.selectedLocationId = asNum;
        localStorage.setItem('lastSelectedLocation', String(asNum));
        this.applyLocationFilter();
      }
    }
    if (inventoryId) {
      setTimeout(() => this.highlightInventoryCard(String(inventoryId)), 250);
    }
    this.pendingQueryParams = null;
  }


  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private toCard(inv: Inventory): InventoryCardItem {
    const item = this.items.find(i => i.barcode === inv.barcode);
    const location = this.locations.find(l => l.location_id === inv.location_id);
    const foodItem = this.inventory.getFoodItems().find(fi => fi.id === inv.barcode);
    // determine if expired or expiring soon (expiration_date is expected as YYYY-MM-DD or ISO)
    let expired = false;
    let expiringSoon = false;
    let formattedDate = '';
    if (inv.expiration_date) {
      const exp = new Date(inv.expiration_date);
      const today = new Date();
      exp.setHours(0,0,0,0);
      today.setHours(0,0,0,0);
      const diffTime = exp.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      expired = exp < today;
      // expiring soon = not expired and within next 7 days (including today)
      expiringSoon = !expired && diffDays <= 7;
      formattedDate = this.datePipe.transform(inv.expiration_date, 'dd.MM.yyyy') ?? '';
    }
    return {
      id: foodItem?.id ?? inv.inventory_id,
      inventoryId: inv.inventory_id,
      name: item?.product_name ?? inv.barcode,
      brand: item?.brand ?? '',
      quantity: item?.quantity ?? '',
      count: inv.quantity,
      img: item?.image_url ?? null,
      badge: inv.expiration_date ? `Ablauf: ${formattedDate}` : undefined,
      isExpired: expired,
      isExpiringSoon: expiringSoon,
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
    item.count -= 1;
    await this.inventory.updateFoodItemQuantity(item.inventoryId, item.count);
  }

  async deleteItem(item: InventoryCardItem) {
    this.inventoryCards = this.inventoryCards.filter(i => i.inventoryId !== item.inventoryId);
    await this.inventory.deleteInventoryItem(item.inventoryId);
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

  highlightedInventoryId: string | null = null;

  highlightInventoryCard(inventoryId: string) {
    this.highlightedInventoryId = inventoryId;
    // attempt to scroll the corresponding card into view
    try {
      const selector = `ion-card.card[data-inventory-id="${inventoryId}"]`;
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el && el.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // determine if we should flash: expired or expiring soon (within 7 days)
        try {
          const inv = this.inventory.getInventorySnapshot().find((i: any) => String(i.inventory_id) === String(inventoryId));
          let shouldFlash = false;
          if (inv && inv.expiration_date) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const expiry = new Date(inv.expiration_date);
            expiry.setHours(0,0,0,0);
            const diffTime = expiry.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // flash if already expired (diffDays < 0) or within next 7 days (<=7)
            if (diffDays <= 7) {
              shouldFlash = true;
            }
          }
          if (shouldFlash) {
            el.classList.add('flash-expired');
            // remove flash class after animation
            setTimeout(() => el.classList.remove('flash-expired'), 1600);
          }
        } catch (e) {
          // ignore snapshot errors and fall back to DOM class
          if (el.classList.contains('expired')) {
            el.classList.add('flash-expired');
            setTimeout(() => el.classList.remove('flash-expired'), 1600);
          }
        }

        // remove highlight after a short delay
        setTimeout(() => (this.highlightedInventoryId = null), 4000);
      }
    } catch (e) {
      // ignore DOM errors
    }
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

  startEditExpiry(item: InventoryCardItem) {
    this.editingId = item.inventoryId;
    // derive date string from badge or underlying inventory data
  const inv = this.inventory.getInventorySnapshot().find((i: any) => i.inventory_id === item.inventoryId);
  const raw = inv?.expiration_date ?? null;
    // if raw is ISO or YYYY-MM-DD, ensure YYYY-MM-DD for input
    this.editingExpiry = raw ? new Date(raw).toISOString().split('T')[0] : null;
  }

  async saveExpiry(item: InventoryCardItem) {
    if (!this.editingId) return;
    try {
      // call service to persist
      await this.inventory.updateExpirationDate(item.inventoryId, this.editingExpiry);
      // update local card badge and expired flag
      const updatedCards = this.inventoryCards.map(c => {
        if (c.inventoryId === item.inventoryId) {
          const formatted = this.editingExpiry ? this.datePipe.transform(this.editingExpiry, 'dd.MM.yyyy') ?? '' : '';
          let isExpired = false;
          let isExpiringSoon = false;
          if (this.editingExpiry) {
            const exp = new Date(this.editingExpiry);
            const today = new Date();
            exp.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            const diffTime = exp.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            isExpired = exp < today;
            isExpiringSoon = !isExpired && diffDays <= 7;
          }
          return {
            ...c,
            badge: this.editingExpiry ? `Ablauf: ${formatted}` : undefined,
            isExpired,
            isExpiringSoon,
          };
        }
        return c;
      });
      this.inventoryCards = this.sortInventoryCards(updatedCards);
      this.applyLocationFilter();
    } catch (error) {
      console.error('Fehler beim Speichern des Ablaufdatums', error);
    } finally {
      this.cancelEdit();
    }
  }

  cancelEdit() {
    this.editingId = null;
    this.editingExpiry = null;
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
    const selectedLocationId = this.selectedLocationId.toString();
    localStorage.setItem('lastSelectedLocation', selectedLocationId);
    this.applyLocationFilter();
  };

  applyLocationFilter() {
    if (!this.selectedLocationId) return;

    this.filteredCards = this.inventoryCards.filter( card => card.locationId === this.selectedLocationId);
  };
}
