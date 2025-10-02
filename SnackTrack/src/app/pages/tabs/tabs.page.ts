import { Component } from '@angular/core';
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
import { IONIC_COMPONENTS } from '../../shared/ionic-components.module';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [RouterLink, ...IONIC_COMPONENTS],
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
