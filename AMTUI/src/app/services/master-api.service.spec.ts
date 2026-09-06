import { TestBed } from '@angular/core/testing';
import { MasterAPIService } from './master-api.service';

describe('MasterAPIService', () => {
  let service: MasterAPIService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MasterAPIService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
