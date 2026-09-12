import { Service } from '@angular/core';
import { UserProfile } from '../../core/app-type-defination';
import { Router } from '@angular/router';
  @Service()
export class LocalStorageService {

    private readonly TOKEN_KEY = 'accessToken';
    private readonly USER_KEY = 'user';

    // constructor(private _router: Router) { }

    // =========================
    // Generic Methods
    // =========================

    setItem(key: string, value: any): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem<T>(key: string): T | null {
        const value = localStorage.getItem(key);
        if (!value) {
            return null;
        }
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }

    clear(): void {
        localStorage.clear();
    }

    // =========================
    // Token
    // =========================

    setToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    removeToken(): void {
        localStorage.removeItem(this.TOKEN_KEY);
    }

    // =========================
    // User
    // =========================

    setUser(user: UserProfile): void {
        localStorage.setItem(
            this.USER_KEY,
            JSON.stringify(user)
        );
    }

    getUser<UserProfile>(): UserProfile | null {
        const user = localStorage.getItem(this.USER_KEY);

        if (!user) {
            return null;
        }

        try {
            return JSON.parse(user) as UserProfile;
        } catch {
            return null;
        }
    }

    removeUser(): void {
        localStorage.removeItem(this.USER_KEY);
    }

    // =========================
    // Login Status
    // =========================

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    // =========================
    // Logout
    // =========================

    logout(): void {
        this.removeToken();
        this.removeUser();
        
    }
}