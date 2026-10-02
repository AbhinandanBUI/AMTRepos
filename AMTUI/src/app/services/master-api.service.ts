import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { APIResponse } from '../core/app-type-defination';
import { ToastService } from './toast.service';

export interface MasterApiRequestOptions {
	headers?: HttpHeaders | Record<string, string | string[]>;
	params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

@Injectable({ providedIn: 'root' })
export class MasterAPIService {
	private readonly baseUrl = 'http://localhost:8080/api';

	constructor(private readonly http: HttpClient, private readonly toast: ToastService) {}

	get(endpoint: string, options?: MasterApiRequestOptions): Observable<APIResponse> {
		return this.notifyErrors(this.http.get<APIResponse>(this.buildUrl(endpoint), options));
	}
	googleLogin(endpoint: string, body: any, options?: MasterApiRequestOptions): Observable<any> {
		return this.notifyErrors(this.http.post<any>(this.buildUrl(endpoint), body, options));
	}

	post(
		endpoint: string,
		body: any,
		options?: MasterApiRequestOptions
	): Observable<APIResponse> {
		return this.notifyErrors(this.http.post<APIResponse>(this.buildUrl(endpoint), body, options));
	}

	put<APIResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<APIResponse> {
		return this.notifyErrors(this.http.put<APIResponse>(this.buildUrl(endpoint), body, options));
	}

	patch<APIResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<APIResponse> {
		return this.notifyErrors(this.http.patch<APIResponse>(this.buildUrl(endpoint), body, options));
	}

	delete(endpoint: string, options?: MasterApiRequestOptions): Observable<APIResponse> {
		return this.notifyErrors(this.http.delete<APIResponse>(this.buildUrl(endpoint), options));
	}

	private notifyErrors<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: { error?: { message?: string }; message?: string }) => {
				this.toast.error(error.error?.message || error.message || 'The request could not be completed.');
				return throwError(() => error);
			})
		);
	}

	private buildUrl(endpoint: string): string {
		if (/^https?:\/\//i.test(endpoint)) {
			return endpoint;
		}

		return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
	}
}
