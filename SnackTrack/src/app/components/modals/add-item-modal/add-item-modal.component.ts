import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FoodItemInterface, FoodUnit } from 'src/app/models/food-item.interface';
import { FoodCategoryInterface } from 'src/app/models/food-category.interface';
import { StorageLocationInterface } from 'src/app/models/storage-location.interface';
import { addIcons } from 'ionicons';
import { close, calendarOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-item-modal',
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class AddItemModalComponent implements OnInit {
  isEdit: boolean = false;
  item?: FoodItemInterface;
  categories: FoodCategoryInterface[] = [];
  storageLocations: StorageLocationInterface[] = [];

  formData = {
    name: '',
    categoryId: '',
    quantity: 1,
    unit: FoodUnit.Piece,
    storageLocationId: '',
    expiryDate: new Date().toISOString(),
  };

  minDate = new Date().toISOString();

  foodUnits = Object.values(FoodUnit);

  constructor(private modalController: ModalController) {
    addIcons({ close, calendarOutline });
  }

  ngOnInit() {
    if (this.isEdit && this.item) {
      this.formData = {
        name: this.item.name,
        categoryId: this.item.category.id,
        quantity: this.item.quantity,
        unit: this.item.unit,
        storageLocationId: this.item.storageLocation.id,
        expiryDate: this.item.expiryDate.toISOString(),
      };
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    const selectedCategory = this.categories.find(c => c.id === this.formData.categoryId);
    const selectedLocation = this.storageLocations.find(l => l.id === this.formData.storageLocationId);

    if (!selectedCategory || !selectedLocation) {
      return;
    }

    const itemData: Partial<FoodItemInterface> = {
      name: this.formData.name,
      category: selectedCategory,
      quantity: this.formData.quantity,
      unit: this.formData.unit,
      storageLocation: selectedLocation,
      expiryDate: new Date(this.formData.expiryDate),
      addedDate: new Date(),
    };

    this.modalController.dismiss(itemData);
  }

  getUnitLabel(unit: FoodUnit): string {
    switch (unit) {
      case FoodUnit.Gram:
        return 'Gramm (g)';
      case FoodUnit.Kilogram:
        return 'Kilogramm (kg)';
      case FoodUnit.Liter:
        return 'Liter (l)';
      case FoodUnit.Piece:
        return 'Stück (Stk)';
      default:
        return unit;
    }
  }

  getCategoryName(): string {
    const category = this.categories.find(c => c.id === this.formData.categoryId);
    return category?.name || '';
  }

  getStorageLocationName(): string {
    const location = this.storageLocations.find(l => l.id === this.formData.storageLocationId);
    return location?.name || '';
  }

  formatExpiryDate(): string {
    return new Date(this.formData.expiryDate).toLocaleDateString('de-DE');
  }
}