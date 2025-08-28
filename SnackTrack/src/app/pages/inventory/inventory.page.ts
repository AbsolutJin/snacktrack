import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';   // für ngModel
import { IonicModule } from '@ionic/angular';

interface InventoryItem {
  name: string;
  img: string;
  unit: string; // z.B. "250g"
  count: number;
  badge?: string; // z.B. Emoji oder Text
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule],
})

export class InventoryPage {
  showSearch = false;
  query = '';
  activeFilters: string[] = [];

  items: InventoryItem[] = [
    { name: 'spaghetti', img: 'assets/img/spaghetti.jpg', unit: '250g', count: 1, badge: '🍝' },
    { name: 'reis', img: 'assets/img/reis.jpg', unit: '500g', count: 2 },
  ];

  filteredItems: InventoryItem[] = [...this.items];

  // UI Aktionen
  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.clearSearch();
    }
  }

  clearSearch() {
    this.query = '';
    this.filter();
  }

  openFilters() {
    // Platzhalter: hier ggf. ActionSheet/Modal mit Filteroptionen öffnen
    // this.activeFilters = ['Beispiel'];
  }

  addDemoItem() {
    const newItem: InventoryItem = {
      name: 'neu',
      img: 'assets/img/placeholder.jpg',
      unit: '100g',
      count: 1,
    };
    this.items = [newItem, ...this.items];
    this.filter();
  }

  // Datenlogik
  filter() {
    const q = this.query.trim().toLowerCase();
    this.filteredItems = !q
      ? [...this.items]
      : this.items.filter(i => (i.name || '').toLowerCase().includes(q));
  }

  increment(item: InventoryItem) {
    item.count += 1;
  }

  decrement(item: InventoryItem) {
    if (item.count > 1) {
      item.count -= 1;
    } else {
      // wenn 0 erreicht, Element entfernen
      this.items = this.items.filter(i => i !== item);
      this.filter();
    }
  }

  trackByName(_index: number, item: InventoryItem) {
    return item.name;
  }
}