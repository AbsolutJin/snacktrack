import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { StorageLocation } from 'src/app/models/storage-location.interface';
import { IONIC_COMPONENTS } from '../../../shared/ionic-components.module';
import { addIcons } from 'ionicons';
import { snowOutline, cubeOutline, close } from 'ionicons/icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-storage-location-modal',
  templateUrl: './storage-location-modal.component.html',
  styleUrls: ['./storage-location-modal.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    ...IONIC_COMPONENTS
  ],
})
export class StorageLocationModalComponent implements OnInit {
  isEdit: boolean = false;
  item?: StorageLocation;

  formData = {
    name: '',
    description: '',
  };

  constructor(private modalController: ModalController) {
    addIcons({ snowOutline, cubeOutline, close });
  }

  ngOnInit() {
    if (this.isEdit && this.item) {
      this.formData = {
        name: this.item.name,
        description: this.item.description || '',
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
