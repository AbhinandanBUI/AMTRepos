import { inject, Injectable, signal } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { UserProfile } from '../../core/app-type-defination';

export interface AuthenticatedProfile extends UserProfile {
	role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly storage = inject(LocalStorageService);
	readonly user = signal<AuthenticatedProfile | null>(
		this.storage.getUser<AuthenticatedProfile>()
	);

	isAuthenticated(): boolean {
		return this.storage.isLoggedIn() && this.user() !== null;
	}

	setUser(user: AuthenticatedProfile): void {
		this.storage.setUser(user);
		this.user.set(user);
	}

	logout(): void {
		this.storage.logout();
		this.user.set(null);
	}
}