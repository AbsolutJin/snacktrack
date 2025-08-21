import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Subject } from 'rxjs';
import { ExpiringItemsListComponent } from '../../components/expiring-items-list/expiring-items-list.component';
import { InventoryStatsComponent } from '../../components/inventory-stats/inventory-stats.component';
import { InventoryChartComponent } from '../../components/inventory-chart/inventory-chart.component';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    CommonModule,
    IonicModule,
    ExpiringItemsListComponent,
    InventoryStatsComponent,
    InventoryChartComponent,
  ],
})
export class DashboardPage implements OnInit, OnDestroy {
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

  constructor(private inventoryService: InventoryService) {}

  ngOnInit() {
    this.loadDashboardData();
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
    const userName = 'Koch'; // Hier könnte der echte Benutzername stehen

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

    // Simuliere Refresh
    setTimeout(() => {
      this.isRefreshing = false;
      // Hier würden Sie die Services neu laden
      console.log('Dashboard Daten wurden aktualisiert');
    }, 2000);
  }

  openSettings() {
    // Navigation zu Settings
    console.log('Öffne Einstellungen');
    // this.router.navigate(['/settings']);
  }

  navigateToAddItem() {
    // Navigation zu Add Item Page
    console.log('Navigation zu Add Item');
    // this.router.navigate(['/tabs/add-item']);
  }

  navigateToInventory() {
    // Navigation zu Inventory List
    console.log('Navigation zu Inventar');
    // this.router.navigate(['/tabs/inventory']);
  }

  scanBarcode() {
    // Barcode Scanner öffnen
    console.log('Öffne Barcode Scanner');
    // Hier würde der Barcode-Scanner gestartet
  }
}
