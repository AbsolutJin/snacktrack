import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AccountService } from './account.service';
import { InventoryService } from './inventory.service';
import { StorageLocationService } from './storage-location.service';
import { ItemService } from './item.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private inventoryService: InventoryService,
    private storageLocationService: StorageLocationService,
    private itemService: ItemService
  ) {}

  async login(email: string, password: string): Promise<void> {
    // Clear all cached data BEFORE login to prevent data leakage
    this.accountService.clearData();
    this.inventoryService.clearData();
    this.storageLocationService.clearData();
    this.itemService.clearData();

    const { error } = await this.authService.signIn(email, password);
    if (error) {
      throw new Error(error.message);
    }
  }
}
