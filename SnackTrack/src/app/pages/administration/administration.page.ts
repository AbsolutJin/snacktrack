import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ModalController, IonicModule, ToastController } from '@ionic/angular';
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
  addOutline
} from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { InventoryService } from 'src/app/services/inventory.service';
import { Observable, Subject } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';

@Component({
  selector: 'app-admin',
  templateUrl: './administration.page.html',
  styleUrls: ['./administration.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class AdministrationPage implements OnInit, OnDestroy {
  // Categories entfernt - nur noch Storage Locations

  // Observables für reactive Daten
  storageLocations$: Observable<StorageLocation[]>;

  // Für Unsubscribe
  private destroy$ = new Subject<void>();

  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private inventoryService: InventoryService,
    private toastService: ToastService
  ) {

    this.storageLocations$ = this.inventoryService.storageLocations$;

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
    
    // Debug: Prüfen ob Daten geladen werden
    this.storageLocations$.subscribe(locations => {
      console.log('[Administration] Storage Locations:', locations);
    });
    
    // Manuell refreshen um sicherzustellen dass Daten geladen werden
    this.refreshData();
  }

  async refreshData() {
    try {
      console.log('[Administration] Refreshing data...');
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


  // Add new storage location
  async addStorageLocation() {
    try {
      const result = await this.inventoryService.openAddModal(this.modalController);
      
      // Bei erfolgreichem Hinzufügen
      if (result && result.success) {
        await this.toastService.success('Lagerort wurde erfolgreich hinzugefügt.');
      }
      // Bei Abbruch
    } catch (error) {
      console.error('Fehler beim Hinzufügen:', error);
      await this.toastService.error('Fehler beim Hinzufügen. Bitte versuchen Sie es erneut.');
    }
  }

  // Edit storage location
  async editStorageLocation(item: StorageLocation) {
    try {
      const result = await this.inventoryService.openEditModal(item, this.modalController);

      // Bei erfolgreichem editieren
      if (result && result.success) {
        await this.toastService.success('Lagerort wurde erfolgreich aktualisiert.');
      }
       // Bei Abbruch
       }catch (error) {
      console.error('Fehler beim Bearbeiten:', error);
      await this.toastService.error('Fehler beim Bearbeiten. Bitte versuchen Sie es erneut.');
    }
  }

  // Delete storage location
  async deleteStorageLocation(item: StorageLocation) {
    try {
      const result = await this.inventoryService.openDeleteConfirmation(item, this.alertController);

      if (result.success) {
        await this.toastService.success('Lagerort wurde erfolgreich gelöscht.');
      }
      // Abbruch
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      await this.toastService.error(
        error instanceof Error ? error.message : 'Unbekannter Fehler beim Löschen.'
      );
    }
  }

}