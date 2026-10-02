import { TestBed } from '@angular/core/testing';
import { AuthService, AuthenticatedProfile } from './auth-service.service';
import { LocalStorageService } from './local-storage.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose and persist the authenticated user role', () => {
    const profile: AuthenticatedProfile = {
      email: 'developer@example.test',
      id: 'user-id',
      name: 'Developer',
      profileUrl: '',
      role: 'Developer',
    };

    TestBed.inject(LocalStorageService).setToken('session-token');
    service.setUser(profile);

    expect(service.user()?.role).toBe('Developer');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should clear the user signal on logout', () => {
    service.logout();

    expect(service.user()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });
});
