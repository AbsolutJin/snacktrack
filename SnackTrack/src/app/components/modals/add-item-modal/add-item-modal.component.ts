import { Component, OnInit, ViewChild, ElementRef, inject, ChangeDetectorRef  } from '@angular/core';
import { ModalController, IonContent } from '@ionic/angular/standalone';
import { FoodItemInterface, FoodUnit } from 'src/app/models/food-item.interface';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { Item } from 'src/app/models/item.interface';
import { CreateInventoryItem } from 'src/app/models/inventory-item.interface';
import { ToastService } from 'src/app/services/toast.service';
import { OpenFoodFactsService, ProductInfo } from 'src/app/services/openfoodfacts.service';
import { InventoryService } from 'src/app/services/inventory.service';
import { ItemService } from 'src/app/services/item.service';
import { AuthService } from 'src/app/services/auth.service';
import { BarcodeService } from 'src/app/services/barcode.service';
import { IONIC_COMPONENTS } from '../../../shared/ionic-components.module';
import { addIcons } from 'ionicons';
import { close, calendarOutline, alertCircleOutline, closeCircle, scanOutline, searchOutline, barcodeOutline, barcode } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-item-modal',
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    ...IONIC_COMPONENTS
  ],
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

  minDate = "2000-01-31T00:00:01"
  maxDate = "2999-12-31T23:59:59"
  foodUnits = Object.values(FoodUnit);

  showValidationErrors = false;

  constructor(
    private modalController: ModalController,
    private toastService: ToastService,
    private openFoodFactsService: OpenFoodFactsService,
    private inventoryService: InventoryService,
    private itemService: ItemService,
    private authService: AuthService,
    private barcodeService: BarcodeService,
    private cdr: ChangeDetectorRef
  ) {
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
      //Erst in Items Table suchen
      const existingItem = await this.itemService.getItemByBarcode(this.formData.barcode);

      if (existingItem) {
        this.fillFormFromItem(existingItem);
        this.productFound = true;
        await this.toastService.success('Produkt aus lokaler Datenbank geladen');
        this.isLoadingProduct = false;
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

      const result = await this.barcodeService.startScan();

      if (result.cancelled) {
        console.log('Scan wurde abgebrochen.'); // Log-Nachricht für dich, keine User-Meldung nötig
        return;
      }

      if (result.text) {
        this.formData.barcode = result.text;
        this.cdr.detectChanges();
        await this.searchByBarcode();
        await this.toastService.success(`Barcode gescannt: ${result.text}`);
      } else {
        await this.toastService.warning('Kein Barcode erkannt. Versuchen Sie es erneut oder geben Sie den Code manuell ein.');
      }

    } catch (error) {
      console.error('Error opening barcode scanner:', error);
      // Vereinfachte Fehlerbehandlung, da Capacitor die meisten Fehler abfängt
      await this.toastService.error(
        'Kamera-Zugriff nicht möglich. Bitte stellen Sie sicher, dass die Berechtigung erteilt wurde.'
      );
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

      this.searchByBarcode();

      const userId = userData.user.id;

      const inventoryItem: CreateInventoryItem = {
        user_id: userId,
        location_id: this.formData.storageLocationId,
        barcode: this.formData.barcode,
        quantity: this.formData.quantity,
        expiration_date: expiryDate.toISOString().split('T')[0],
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
