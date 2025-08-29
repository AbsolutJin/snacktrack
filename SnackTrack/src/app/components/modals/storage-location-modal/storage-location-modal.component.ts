import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { StorageLocationInterface } from 'src/app/models/storage-location.interface';
import { addIcons } from 'ionicons';
import { snowOutline, cubeOutline, close } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-storage-location-modal',
  templateUrl: './storage-location-modal.component.html',
  styleUrls: ['./storage-location-modal.component.scss'],
  imports: [IonicModule, FormsModule, CommonModule],
})
export class StorageLocationModalComponent implements OnInit {
  isEdit: boolean = false;
  item?: StorageLocationInterface;

  formData = {
    name: '',
    color: 'primary',
  };

  constructor(private modalController: ModalController) {
    addIcons({ snowOutline, cubeOutline, close });
  }

  ngOnInit() {
    if (this.isEdit && this.item) {
      this.formData = {
        name: this.item.name,
        color: this.item.color,
      };
    }
  }

  dismiss() {
    this.modalController.dismiss();
  }

  save() {
    this.modalController.dismiss(this.formData);
  }
}
