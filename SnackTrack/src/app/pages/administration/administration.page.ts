import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular/standalone';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { CommonModule } from '@angular/common';
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
  addOutline,
  optionsOutline
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { InventoryService } from 'src/app/services/inventory.service';
import { StorageLocationService } from 'src/app/services/storage-location.service';
import { Observable, Subject } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';

@Component({
  selector: 'app-admin',
  templateUrl: './administration.page.html',
  styleUrls: ['./administration.page.scss'],
  imports: [CommonModule, FormsModule, ...IONIC_COMPONENTS],
})
export class AdministrationPage implements OnInit, OnDestroy {

  storageLocations$: Observable<StorageLocation[]>;

  private destroy$ = new Subject<void>();

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private inventoryService: InventoryService,
    private storageLocationService: StorageLocationService,
    private toastService: ToastService
  ) {

    this.storageLocations$ = this.storageLocationService.storageLocations$;

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
      addOutline,
      optionsOutline
    });
  }

  ngOnInit() {
    this.storageLocations$ = this.storageLocationService.storageLocations$;
    
    this.storageLocations$.subscribe(locations => {
      console.log('[Administration] Storage Locations:', locations);
    });
    
    this.refreshData();
  }

  async refreshData() {
    try {
      console.log('[Administration] Refreshing data...');
      await this.storageLocationService.loadStorageLocations();
      await this.inventoryService.refreshData();
      console.log('[Administration] Data refreshed');
    } catch (error) {
      console.error('[Administration] Error refreshing data:', error);
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  async addStorageLocation() {
    try {
      const modal = await this.modalController.create({
        component: (await import('../../components/modals/storage-location-modal/storage-location-modal.component')).StorageLocationModalComponent,
        componentProps: { isEdit: false },
      });

      await modal.present();
      const result = await modal.onDidDismiss();

      if (result.data) {
        await this.storageLocationService.createStorageLocation(result.data);
        await this.toastService.success('Lagerort wurde erfolgreich hinzugefügt.');
      }
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      await this.toastService.error('Fehler beim Hinzufügen. Bitte versuchen Sie es erneut.');
    }
  }

  async editStorageLocation(item: StorageLocation) {
    try {
      const modal = await this.modalController.create({
        component: (await import('../../components/modals/storage-location-modal/storage-location-modal.component')).StorageLocationModalComponent,
        componentProps: {
          isEdit: true,
          item: { ...item },
        },
      });

      await modal.present();
      const result = await modal.onDidDismiss();

      if (result.data) {
        const updatedItem = { ...item, ...result.data };
        await this.storageLocationService.updateStorageLocation(item.location_id, updatedItem);
        await this.toastService.success('Lagerort wurde erfolgreich aktualisiert.');
      }
    } catch (error) {
      console.error('Fehler beim Bearbeiten:', error);
      await this.toastService.error('Fehler beim Bearbeiten. Bitte versuchen Sie es erneut.');
    }
  }

  async deleteStorageLocation(item: StorageLocation) {
    try {
        const canDelete = await this.inventoryService.canDeleteStorageLocation(item.location_id);

      if (!canDelete) {
        await this.toastService.error('Dieser Lagerort kann nicht gelöscht werden, da noch Artikel darin gespeichert sind.');
        return;
      }

      const alert = await this.alertController.create({
        header: 'Lagerort löschen',
        message: `Möchten Sie "${item.name}" wirklich löschen?`,
        buttons: [
          {
            text: 'Abbrechen',
            role: 'cancel',
          },
          {
            text: 'Löschen',
            role: 'destructive',
            handler: async () => {
              try {
                await this.storageLocationService.deleteStorageLocation(item.location_id);
                await this.toastService.success('Lagerort wurde erfolgreich gelöscht.');
              } catch (error) {
                console.error('Fehler beim Löschen:', error);
                await this.toastService.error('Fehler beim Löschen des Lagerorts.');
              }
            },
          },
        ],
      });

      await alert.present();
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      await this.toastService.error(
        error instanceof Error ? error.message : 'Unbekannter Fehler beim Löschen.'
      );
    }
  }

}