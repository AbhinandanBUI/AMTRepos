import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MasterApiRequestOptions {
	headers?: HttpHeaders | Record<string, string | string[]>;
	params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

@Injectable({ providedIn: 'root' })
export class MasterAPIService {
	private readonly baseUrl = 'http://localhost:8080/api';

	constructor(private readonly http: HttpClient) {}

	get<TResponse>(endpoint: string, options?: MasterApiRequestOptions): Observable<TResponse> {
		return this.http.get<TResponse>(this.buildUrl(endpoint), options);
	}

	post<TResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<TResponse> {
		return this.http.post<TResponse>(this.buildUrl(endpoint), body, options);
	}

	put<TResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<TResponse> {
		return this.http.put<TResponse>(this.buildUrl(endpoint), body, options);
	}

	patch<TResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<TResponse> {
		return this.http.patch<TResponse>(this.buildUrl(endpoint), body, options);
	}

	delete<TResponse>(endpoint: string, options?: MasterApiRequestOptions): Observable<TResponse> {
		return this.http.delete<TResponse>(this.buildUrl(endpoint), options);
	}

	private buildUrl(endpoint: string): string {
		if (/^https?:\/\//i.test(endpoint)) {
			return endpoint;
		}

		return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
	}
}
