import { StorageLocation } from '../../models/storage-location.interface';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ExpiringItemsListComponent } from '../../components/expiring-items-list/expiring-items-list.component';
import { InventoryChartComponent } from '../../components/inventory-chart/inventory-chart.component';
import { AddItemModalComponent } from '../../components/modals/add-item-modal/add-item-modal.component';
import { InventoryService } from '../../services/inventory.service';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  calendarOutline,
  flashOutline,
  informationCircleOutline,
  leafOutline,
  listOutline,
  scanOutline,
  speedometerOutline,
  thermometerOutline,
  timeOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    ExpiringItemsListComponent,
    InventoryChartComponent,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  storageLocations: StorageLocation[] = [];
  stats: { itemsByLocation: { [key: string]: number }, totalItems: number } = { itemsByLocation: {}, totalItems: 0 };

  getProgress(count: number, total: number): number {
    return total > 0 ? count / total : 0;
  }
  private destroy$ = new Subject<void>();

  isLoading = true;
  isRefreshing = false;

  dailyTips = [
    {
      icon: 'leaf-outline',
      color: 'success',
      title: 'Lebensmittel richtig lagern',
      description:
        'Bewahren Sie Bananen getrennt von anderem Obst auf, um die Reifung zu verlangsamen.',
    },
    {
      icon: 'time-outline',
      color: 'warning',
      title: 'FIFO-Prinzip',
      description:
        'First In, First Out - Verwenden Sie ältere Lebensmittel zuerst.',
    },
    {
      icon: 'thermometer-outline',
      color: 'primary',
      title: 'Temperatur beachten',
      description:
        'Ihr Kühlschrank sollte zwischen 1-4°C haben für optimale Haltbarkeit.',
    },
  ];

  constructor(
    private inventoryService: InventoryService,
    private modalController: ModalController,
    private router: Router
  ) {
    addIcons({
      leafOutline,
      timeOutline,
      thermometerOutline,
      listOutline,
      calendarOutline,
      addCircleOutline,
      scanOutline,
      informationCircleOutline,
      speedometerOutline,
      flashOutline,
    });
  }

  ngOnInit() {
    this.loadDashboardData();
    // Subscribe to storageLocations$ from InventoryService
    this.inventoryService.storageLocations$.subscribe(locations => {
      this.storageLocations = locations;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    // Ladezeit Simulieren, um sicherzustellen, dass UI Elemente geladen sind kann auch auf echte Funktionalität umgestellt werden
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    const userName = 'Koch'; // Hier muss der Nutzername geladen werden

    if (hour < 12) {
      return `Guten Morgen, ${userName}! Zeit für ein gesundes Frühstück.`;
    } else if (hour < 18) {
      return `Guten Tag, ${userName}! Was steht heute auf dem Speiseplan?`;
    } else {
      return `Guten Abend, ${userName}! Zeit für ein leckeres Abendessen.`;
    }
  }

  refreshData() {
    this.isRefreshing = true;

    // Neuladen simulieren
    setTimeout(() => {
      this.isRefreshing = false;
      //Services neu laden
      console.log('Dashboard Daten wurden aktualisiert');
    }, 2000);
  }

  async navigateToAddItem() {
    console.log('Opening add item modal...');
    try {
      const modal = await this.modalController.create({
        component: AddItemModalComponent,
        componentProps: {
          isEdit: false,
          categories: this.inventoryService.getCategories(),
          storageLocations: this.inventoryService.getStorageLocations(),
        },
      });

      await modal.present();
      const result = await modal.onDidDismiss();

      if (result.data) {
        try {
          // Add the new item using the inventory service
          // TODO: Add addFoodItem method to InventoryService
          console.log('New food item to add:', result.data);
        } catch (error) {
          console.error('Fehler beim Hinzufügen des Artikels:', error);
        }
      }
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  navigateToInventory() {
    this.router.navigate(['/tabs/kitchen']);
  }

  scanBarcode() {
    // Hatten wir BarcodeScanner besprochen? erstmal platzhalter
    console.log('Öffne Barcode Scanner');
  }
}
