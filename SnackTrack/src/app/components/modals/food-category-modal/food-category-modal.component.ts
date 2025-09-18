import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FoodCategoryInterface } from 'src/app/models/food-category.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  appsOutline,
  close,
  flowerOutline,
  heartOutline,
  leafOutline,
  nutritionOutline,
  restaurantOutline,
  waterOutline,
  wineOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-food-category-modal',
  templateUrl: './food-category-modal.component.html',
  styleUrls: ['./food-category-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class FoodCategoryModalComponent implements OnInit {
  isEdit: boolean = false;
  item?: FoodCategoryInterface;

  formData = {
    name: '',
    icon: '',
    color: 'success',
  };

  // Suggested icons for food categories
  suggestedIcons = [
    { name: 'Obst', icon: 'leaf-outline' },
    { name: 'Gemüse', icon: 'nutrition-outline' },
    { name: 'Fleisch', icon: 'restaurant-outline' },
    { name: 'Milchprodukte', icon: 'water-outline' },
    { name: 'Getreide', icon: 'apps-outline' },
    { name: 'Süßwaren', icon: 'heart-outline' },
    { name: 'Getränke', icon: 'wine-outline' },
    { name: 'Gewürze', icon: 'flower-outline' },
  ];

  constructor(private modalController: ModalController) {
    addIcons({
      leafOutline,
      nutritionOutline,
      restaurantOutline,
      waterOutline,
      appsOutline,
      heartOutline,
      wineOutline,
      flowerOutline,
      close,
    });
  }

  ngOnInit() {
    if (this.isEdit && this.item) {
      this.formData = {
        name: this.item.name,
        icon: this.item.icon,
  color: this.item.color ?? 'success',
      };
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    this.modalController.dismiss(this.formData);
  }

  selectIcon(icon: string) {
    this.formData.icon = icon;
  }
}
