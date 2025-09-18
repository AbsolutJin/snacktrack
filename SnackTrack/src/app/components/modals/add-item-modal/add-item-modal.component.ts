import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController, IonicModule, IonContent } from '@ionic/angular';
import { FoodItemInterface, FoodUnit } from 'src/app/models/food-item.interface';
import { FoodCategoryInterface } from 'src/app/models/food-category.interface';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { ToastService } from 'src/app/services/toast.service';
import { addIcons } from 'ionicons';
import { close, calendarOutline, alertCircleOutline, closeCircle } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-item-modal',
  templateUrl: './add-item-modal.component.html',
  styleUrls: ['./add-item-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class AddItemModalComponent implements OnInit {
  @ViewChild('content', { static: false }) content!: IonContent;
  
  isEdit: boolean = false;
  item?: FoodItemInterface;
  categories: FoodCategoryInterface[] = [];
  storageLocations: StorageLocation[] = [];

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
  
  // Validation state
  showValidationErrors = false;

  constructor(
    private modalController: ModalController,
    private toastService: ToastService
  ) {
    addIcons({ close, calendarOutline, alertCircleOutline, closeCircle });
  }

  ngOnInit() {
    if (this.isEdit && this.item) {
      this.formData = {
        name: this.item.name,
        categoryId: this.item.category.id,
        quantity: this.item.quantity,
        unit: this.item.unit,
  storageLocationId: this.item.storageLocation.location_id,
        expiryDate: this.item.expiryDate.toISOString(),
      };
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  async save() {
    try {
      // Zeige Validierungsfehler an der Spitze wenn Formular nicht valid ist
      if (!this.isFormValid()) {
        this.showValidationErrors = true;
        this.scrollToTop();
        return;
      }

      const selectedCategory = this.categories.find(c => c.id === this.formData.categoryId);
  const selectedLocation = this.storageLocations.find(l => l.location_id === this.formData.storageLocationId);

      if (!selectedCategory) {
        await this.toastService.error('Die ausgewählte Kategorie konnte nicht gefunden werden.');
        return;
      }

      if (!selectedLocation) {
        await this.toastService.error('Der ausgewählte Lagerort konnte nicht gefunden werden.');
        return;
      }

      // Prüfung ob Ablaufdatum in der Vergangenheit liegt
      const expiryDate = new Date(this.formData.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        await this.toastService.warning('Das Ablaufdatum liegt in der Vergangenheit. Möchten Sie trotzdem fortfahren?');
        // Hier könnte man eine Bestätigung einbauen, erstmal weiter
      }

      const itemData: Partial<FoodItemInterface> = {
        name: this.formData.name.trim(),
        category: selectedCategory,
        quantity: this.formData.quantity,
        unit: this.formData.unit,
        storageLocation: selectedLocation,
        expiryDate: expiryDate,
        addedDate: new Date(),
      };

      // Erfolgreiche Validierung
      await this.toastService.success(this.isEdit ? 'Artikel erfolgreich aktualisiert!' : 'Artikel erfolgreich hinzugefügt!');
      this.modalController.dismiss(itemData);
      
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

  getCategoryName(): string {
    const category = this.categories.find(c => c.id === this.formData.categoryId);
    return category?.name || '';
  }

  getStorageLocationName(): string {
  const location = this.storageLocations.find(l => l.location_id === this.formData.storageLocationId);
    return location?.name || '';
  }

  formatExpiryDate(): string {
    return new Date(this.formData.expiryDate).toLocaleDateString('de-DE');
  }

  // Validation methods
  getValidationErrors(): string[] {
    const errors: string[] = [];
    
    if (!this.formData.name.trim()) {
      errors.push('Name des Artikels fehlt');
    }
    
    if (!this.formData.categoryId) {
      errors.push('Kategorie nicht ausgewählt');
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
    // Scroll to top of modal content using ViewChild
    setTimeout(() => {
      if (this.content) {
        this.content.scrollToTop(300);
      }
    }, 150);
  }
}