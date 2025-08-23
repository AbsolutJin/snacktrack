//TODO - Refactor this page to use InventoryService for data management

import { Component } from '@angular/core';
import { AlertController, ModalController, IonicModule } from '@ionic/angular';
import { StorageLocationModalComponent } from 'src/app/components/modals/storage-location-modal/storage-location-modal.component';
import { FoodCategoryModalComponent } from 'src/app/components/modals/food-category-modal/food-category-modal.component';
import { StorageLocationInterface } from 'src/app/models/storage-location.interface';
import { FoodCategoryInterface } from 'src/app/models/food-category.interface';
import { TitleCasePipe, CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  archiveOutline,
  gridOutline,
  createOutline,
  trashOutline,
  nutritionOutline,
  leafOutline,
  restaurantOutline,
  waterOutline,
  appsOutline,
  heartOutline,
  wineOutline,
  flowerOutline,
  addOutline
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { InventoryService } from 'src/app/services/inventory.service';

@Component({
  selector: 'app-admin',
  templateUrl: './administration.page.html',
  styleUrls: ['./administration.page.scss'],
  imports: [IonicModule, TitleCasePipe, CommonModule, FormsModule],
})
export class AdministrationPage {
  selectedSegment: string = 'storage';

  // DEMODATEN
  storageLocations: StorageLocationInterface[] = [
    { id: '1', name: 'Kühlschrank', color: 'primary' },
    { id: '2', name: 'Tiefkühler', color: 'tertiary' },
    { id: '3', name: 'Speisekammer', color: 'secondary' },
  ];

  foodCategories: FoodCategoryInterface[] = [
    { id: '1', name: 'Obst', icon: 'leaf-outline', color: 'success' },
    { id: '2', name: 'Gemüse', icon: 'nutrition-outline', color: 'success' },
    { id: '3', name: 'Milchprodukte', icon: 'water-outline', color: 'primary' },
  ];

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private inventoryService: InventoryService ) {
    addIcons({
      archiveOutline,
      gridOutline,
      createOutline,
      trashOutline,
      leafOutline,
      nutritionOutline,
      restaurantOutline,
      waterOutline,
      appsOutline,
      heartOutline,
      wineOutline,
      flowerOutline,
      addOutline
    });
  }

  // Tab change handler
  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  // Add new item
  async addItem(type: 'storage' | 'category') {
    const component =
      type === 'storage'
        ? StorageLocationModalComponent
        : FoodCategoryModalComponent;

    const modal = await this.modalController.create({
      component: component,
      componentProps: {
        isEdit: false,
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        const newItem = {
          id: this.generateId(),
          ...result.data,
        };

        if (type === 'storage') {
          this.storageLocations.push(newItem);
        } else {
          this.foodCategories.push(newItem);
        }
      }
    });

    return await modal.present();
  }

  // Edit item
  async editItem(
    item: StorageLocationInterface | FoodCategoryInterface,
    type: 'storage' | 'category'
  ) {
    const component =
      type === 'storage'
        ? StorageLocationModalComponent
        : FoodCategoryModalComponent;

    const modal = await this.modalController.create({
      component: component,
      componentProps: {
        isEdit: true,
        item: { ...item },
      },
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        if (type === 'storage') {
          const index = this.storageLocations.findIndex(
            (s) => s.id === item.id
          );
          if (index !== -1) {
            this.storageLocations[index] = { ...item, ...result.data };
          }
        } else {
          const index = this.foodCategories.findIndex((c) => c.id === item.id);
          if (index !== -1) {
            this.foodCategories[index] = { ...item, ...result.data };
          }
        }
      }
    });

    return await modal.present();
  }

  // Delete item
  async deleteItem(
    item: StorageLocationInterface | FoodCategoryInterface,
    type: 'storage' | 'category'
  ) {
    const alert = await this.alertController.create({
      header: 'Löschen bestätigen',
      message: `Möchten Sie "${item.name}" wirklich löschen?`,
      buttons: [
        {
          text: 'Abbrechen',
          role: 'cancel',
        },
        {
          text: 'Löschen',
          role: 'destructive',
          handler: () => {
            if (type === 'storage') {
              this.storageLocations = this.storageLocations.filter(
                (s) => s.id !== item.id
              );
            } else {
              this.foodCategories = this.foodCategories.filter(
                (c) => c.id !== item.id
              );
            }
          },
        },
      ],
    });

    await alert.present();
  }

  getStorageLocations(): StorageLocationInterface[] {
    return this.inventoryService.getStorageLocations();
  }

  getCategories(): FoodCategoryInterface[] {
    return this.inventoryService.getCategories();
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
