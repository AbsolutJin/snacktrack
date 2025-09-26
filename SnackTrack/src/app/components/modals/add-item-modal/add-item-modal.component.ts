import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ModalController, IonicModule, IonContent } from '@ionic/angular';
import { FoodItemInterface, FoodUnit } from 'src/app/models/food-item.interface';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { Item } from 'src/app/models/item.interface';
import { CreateInventoryItem } from 'src/app/models/inventory-item.interface';
import { ToastService } from 'src/app/services/toast.service';
import { OpenFoodFactsService, ProductInfo } from 'src/app/services/openfoodfacts.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { ItemService } from 'src/app/services/item.service';
import { AuthService } from 'src/app/services/auth.service';
import { addIcons } from 'ionicons';
import { close, calendarOutline, alertCircleOutline, closeCircle, scanOutline, searchOutline, barcodeOutline } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-item-modal',
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
  standalone: true
})
export class AddItemModalComponent implements OnInit {
  @ViewChild('content', { static: false }) content!: IonContent;
  
  isEdit: boolean = false;
  item?: FoodItemInterface;
  storageLocations: StorageLocation[] = [];

  formData = {
    barcode: '',
    name: '',
    brand: '',
    quantity: 1,
    unit: FoodUnit.Piece,
    storageLocationId: '',
    expiryDate: new Date().toISOString(),
    notes: '',
    image_url: null as string | null
  };

  isLoadingProduct = false;
  productFound = false;

  minDate = new Date().toISOString();
  foodUnits = Object.values(FoodUnit);
  
  showValidationErrors = false;

  private modalController = inject(ModalController);
  private toastService = inject(ToastService);
  private openFoodFactsService = inject(OpenFoodFactsService);
  private inventoryService = inject(InventoryService);
  private itemService = inject(ItemService);
  private authService = inject(AuthService);

  constructor() {
    addIcons({ close, calendarOutline, alertCircleOutline, closeCircle, scanOutline, searchOutline, barcodeOutline });
  }

  ngOnInit() {
    if (this.isEdit && this.item) {
      this.formData = {
        barcode: '',
        name: this.item.name,
        brand: '',
        quantity: this.item.quantity,
        unit: this.item.unit,
        storageLocationId: this.item.storageLocation.location_id,
        expiryDate: this.item.expiryDate.toISOString(),
        notes: '',
        image_url: null
      };
    }
  }

  async searchByBarcode() {
    if (!this.formData.barcode.trim()) {
      await this.toastService.warning('Bitte einen Barcode eingeben');
      return;
    }

    this.isLoadingProduct = true;
    this.productFound = false;

    try {
      // 1. Erst in lokaler Items-Tabelle suchen
      const existingItem = await this.itemService.getItemByBarcode(this.formData.barcode);

      if (existingItem) {
        this.fillFormFromItem(existingItem);
        this.productFound = true;
        await this.toastService.success('Produkt aus lokaler Datenbank geladen');
      } else {
        this.openFoodFactsService.getProductByBarcode(this.formData.barcode).subscribe({
          next: async (product) => {
            if (product) {
              this.fillFormFromProductInfo(product);
              this.productFound = true;
              await this.toastService.success('Produkt von OpenFoodFacts geladen');

              await this.itemService.saveNewItem(product);
            } else {
              await this.toastService.warning('Produkt nicht gefunden. Sie können die Daten manuell eingeben.');
            }
            this.isLoadingProduct = false;
          },
          error: async (error) => {
            console.error('Error fetching product:', error);
            await this.toastService.error('Fehler beim Laden des Produkts');
            this.isLoadingProduct = false;
          }
        });
      }
    } catch (error) {
      console.error('Error searching product:', error);
      await this.toastService.error('Fehler bei der Produktsuche');
      this.isLoadingProduct = false;
    }
  }

  private fillFormFromItem(item: Item) {
    this.formData.name = item.product_name;
    this.formData.brand = item.brand;
    this.formData.image_url = item.image_url;
  }

  private fillFormFromProductInfo(product: ProductInfo) {
    this.formData.name = product.product_name;
    this.formData.brand = product.brand;
    this.formData.image_url = product.image_url;
  }

  async openBarcodeScanner() {
    try {
      await this.toastService.warning('Barcode-Scanner noch nicht implementiert. Bitte Barcode manuell eingeben.');

    } catch (error) {
      console.error('Error opening barcode scanner:', error);
      await this.toastService.error('Fehler beim Öffnen des Barcode-Scanners');
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async save() {
    try {
      if (!this.isFormValid()) {
        this.showValidationErrors = true;
        this.scrollToTop();
        return;
      }

      if (!this.formData.barcode.trim()) {
        await this.toastService.error('Barcode ist erforderlich');
        return;
      }

      const expiryDate = new Date(this.formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (expiryDate < today) {
        await this.toastService.warning('Das Ablaufdatum liegt in der Vergangenheit. Möchten Sie trotzdem fortfahren?');
      }

      const { data: userData, error: userError } = await this.authService.getCurrentUser();

      if (userError || !userData.user) {
        await this.toastService.error('Benutzer nicht authentifiziert');
        return;
      }

      const userId = userData.user.id;

      const inventoryItem: CreateInventoryItem = {
        user_id: userId,
        location_id: this.formData.storageLocationId,
        barcode: this.formData.barcode,
        quantity: this.formData.quantity,
        expiration_date: expiryDate.toISOString().split('T')[0], // YYYY-MM-DD format
        notes: this.formData.notes || undefined
      };

      await this.inventoryService.createInventoryItem(inventoryItem);

      await this.toastService.success(this.isEdit ? 'Artikel erfolgreich aktualisiert!' : 'Artikel erfolgreich hinzugefügt!');
      this.modalController.dismiss({ success: true, item: inventoryItem });

    } catch (error) {
      console.error('Fehler beim Speichern des Artikels:', error);
      await this.toastService.error('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    }
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


  getStorageLocationName(): string {
  const location = this.storageLocations.find(l => l.location_id === this.formData.storageLocationId);
    return location?.name || '';
  }

  formatExpiryDate(): string {
    return new Date(this.formData.expiryDate).toLocaleDateString('de-DE');
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.formData.barcode.trim()) {
      errors.push('Barcode fehlt');
    }

    if (!this.formData.name.trim()) {
      errors.push('Name des Artikels fehlt');
    }

    if (!this.formData.storageLocationId) {
      errors.push('Lagerort nicht ausgewählt');
    }

    if (this.formData.quantity <= 0) {
      errors.push('Menge muss größer als 0 sein');
    }

    if (!this.formData.expiryDate) {
      errors.push('Ablaufdatum nicht ausgewählt');
    }

    return errors;
  }

  isFormValid(): boolean {
    return this.getValidationErrors().length === 0;
  }

  scrollToTop(): void {
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToTop(300);
      }
    }, 150);
  }
}