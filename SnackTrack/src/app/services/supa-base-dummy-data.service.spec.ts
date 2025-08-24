import { TestBed } from '@angular/core/testing';

import { SupaBaseDummyDataService } from './supa-base-dummy-data.service';

describe('SupaBaseDummyDataService', () => {
  let service: SupaBaseDummyDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupaBaseDummyDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
