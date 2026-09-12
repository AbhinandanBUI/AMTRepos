import { HttpInterceptorFn } from '@angular/common/http';
import { LocalStorageService } from '../services/StorageServices/local-storage.service';
import { inject } from '@angular/core';

export const authInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const localStorageService = inject(LocalStorageService);
  const token = localStorageService.getToken();
  // Don't modify request if token doesn't exist 
  console.log('token',token);
  
  if (!token) { return next(req); }

  // Clone request and add Authorization header 
  const authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }); return next(authReq);
};