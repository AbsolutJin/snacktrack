import { Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline,
  personOutline,
  home,
  person,
  restaurantOutline,
  listCircleOutline,
  bookOutline,
  optionsOutline
} from 'ionicons/icons';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, RouterLink],
})
export class TabsPage {
  constructor() {
    addIcons({
      homeOutline,
      home,
      personOutline,
      person,
      restaurantOutline,
      listCircleOutline,
      bookOutline,
      optionsOutline
    });
  }
}
