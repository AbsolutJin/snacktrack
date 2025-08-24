import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController, IonicModule, ToastController } from '@ionic/angular';
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
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-admin',
  templateUrl: './administration.page.html',
  styleUrls: ['./administration.page.scss'],
  imports: [IonicModule, TitleCasePipe, CommonModule, FormsModule],
})
export class AdministrationPage implements OnInit, OnDestroy {
  selectedSegment: string = 'storage';

  // Observables für reactive Daten
  storageLocations$: Observable<StorageLocationInterface[]>;
  categories$: Observable<FoodCategoryInterface[]>;

  // Für Unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private inventoryService: InventoryService,
    private toastController: ToastController
  ) {

    this.storageLocations$ = this.inventoryService.storageLocations$;
    this.categories$ = this.inventoryService.categories$;

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

  ngOnInit() {
    // Observables vom Service abonnieren
    this.storageLocations$ = this.inventoryService.storageLocations$;
    this.categories$ = this.inventoryService.categories$;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Tab change handler
  onSegmentChange(event: any) {
    this.selectedSegment = event.detail.value;
  }

  // Add new item
  async addItem(type: 'storage' | 'category') {
    try {
      await this.inventoryService.openAddModal(type, this.modalController);
      await this.showToast(`${type === 'storage' ? 'Lagerort' : 'Kategorie'} wurde erfolgreich hinzugefügt.`, 'success');
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      await this.showToast('Fehler beim Hinzufügen. Bitte versuchen Sie es erneut.', 'danger');
    }
  }

  // Edit item
  async editItem(
    item: StorageLocationInterface | FoodCategoryInterface,
    type: 'storage' | 'category'
  ) {
    try {
      await this.inventoryService.openEditModal(item, type, this.modalController);
      await this.showToast(`${type === 'storage' ? 'Lagerort' : 'Kategorie'} wurde erfolgreich aktualisiert.`, 'success');
    } catch (error) {
      console.error('Fehler beim Bearbeiten:', error);
      await this.showToast('Fehler beim Bearbeiten. Bitte versuchen Sie es erneut.', 'danger');
    }
  }

  // Delete item
  async deleteItem(
    item: StorageLocationInterface | FoodCategoryInterface,
    type: 'storage' | 'category'
  ) {
    try {
      await this.inventoryService.openDeleteConfirmation(item, type, this.alertController);
      await this.showToast(`${type === 'storage' ? 'Lagerort' : 'Kategorie'} wurde erfolgreich gelöscht.`, 'success');
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      await this.showToast(
        error instanceof Error ? error.message : 'Unbekannter Fehler beim Löschen.',
        'danger'
      );
    }
  }

  // Helper method für Toast-Nachrichten
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }
}