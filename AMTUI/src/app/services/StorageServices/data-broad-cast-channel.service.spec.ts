import { TestBed } from '@angular/core/testing';
import { DataBroadCastChannelService } from './data-broad-cast-channel.service';

describe('DataBroadCastChannelService', () => {
  let service: DataBroadCastChannelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DataBroadCastChannelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
