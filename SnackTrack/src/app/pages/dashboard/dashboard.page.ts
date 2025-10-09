import { StorageLocation } from '../../models/storage-location.interface';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ExpiringItemsListComponent } from '../../components/expiring-items-list/expiring-items-list.component';
import { InventoryChartComponent } from '../../components/inventory-chart/inventory-chart.component';
import { AddItemModalComponent } from '../../components/modals/add-item-modal/add-item-modal.component';
import { InventoryService } from '../../services/inventory.service';
import { StorageLocationService } from '../../services/storage-location.service';
import { AccountService } from '../../services/account.service';
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';
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
import { Inventory } from 'src/app/models/inventory.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule,
    ...IONIC_COMPONENTS,
    ExpiringItemsListComponent,
    InventoryChartComponent,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
  storageLocations: StorageLocation[] = [];
  displayItems: Inventory[] = [];
  stats: { itemsByLocation: { [key: string]: number }, totalItems: number } = { itemsByLocation: {}, totalItems: 0 };
  currentUserName: string = 'Koch';

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
    private storageLocationService: StorageLocationService,
    private modalController: ModalController,
    private router: Router,
    private accountService: AccountService
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

    this.accountService.profile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.currentUserName = profile?.username || 'Koch';
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return `Guten Morgen, ${this.currentUserName}! Zeit für ein gesundes Frühstück.`;
    } else if (hour < 18) {
      return `Guten Tag, ${this.currentUserName}! Was steht heute auf dem Speiseplan?`;
    } else {
      return `Guten Abend, ${this.currentUserName}! Zeit für ein leckeres Abendessen.`;
    }
  }

  refreshData() {
    this.isRefreshing = true;

    setTimeout(() => {
      this.isRefreshing = false;
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
          storageLocations: this.storageLocationService.getStorageLocations(),
        },
      });

      await modal.present();
      const result = await modal.onDidDismiss();

      if (result.data) {
        try {
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

  navigateToManageLocations() {
    // Navigate to the Stammdaten -> Lagerorte page. Adjust route if your app uses a different path.
    this.router.navigate(['/stammdaten/locations']);
  }
}
