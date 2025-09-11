import { Component, OnDestroy, OnInit } from '@angular/core';
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