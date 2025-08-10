import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddItemPage } from './add-item.page';

describe('AddItemPage', () => {
  let component: AddItemPage;
  let fixture: ComponentFixture<AddItemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
