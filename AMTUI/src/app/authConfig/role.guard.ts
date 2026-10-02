import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/StorageServices/auth-service.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.user();
  const requiredRoles = route.data['roles'] as string[] | undefined;

  if (!auth.isAuthenticated() || !user) return router.parseUrl('/signin');
  if (!requiredRoles?.length || requiredRoles.includes(user.role || '')) return true;

  const modulePath = route.data['modulePath'] as string | undefined;
  if (modulePath) {
    const normalizedModulePath = `/${modulePath.replace(/^\/+|\/+$/g, '')}`;
    return router.parseUrl(
      `${normalizedModulePath}/unauthorized?returnTo=${encodeURIComponent(normalizedModulePath)}`
    );
  }

  return router.parseUrl('/unauthorized');
};