import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class InventoryPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
