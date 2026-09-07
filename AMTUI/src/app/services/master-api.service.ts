import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { APIResponse } from '../core/app-type-defination';

export interface MasterApiRequestOptions {
	headers?: HttpHeaders | Record<string, string | string[]>;
	params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
}

@Injectable({ providedIn: 'root' })
export class MasterAPIService {
	private readonly baseUrl = 'http://localhost:8080/api';

	constructor(private readonly http: HttpClient) {}

	get(endpoint: string, options?: MasterApiRequestOptions): Observable<APIResponse> {
		return this.http.get<APIResponse>(this.buildUrl(endpoint), options);
	}

	post(
		endpoint: string,
		body: any,
		options?: MasterApiRequestOptions
	): Observable<APIResponse> {
		return this.http.post<APIResponse>(this.buildUrl(endpoint), body, options);
	}

	put<APIResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<APIResponse> {
		return this.http.put<APIResponse>(this.buildUrl(endpoint), body, options);
	}

	patch<APIResponse, TBody = unknown>(
		endpoint: string,
		body: TBody,
		options?: MasterApiRequestOptions
	): Observable<APIResponse> {
		return this.http.patch<APIResponse>(this.buildUrl(endpoint), body, options);
	}

	delete(endpoint: string, options?: MasterApiRequestOptions): Observable<APIResponse> {
		return this.http.delete<APIResponse>(this.buildUrl(endpoint), options);
	}

	private buildUrl(endpoint: string): string {
		if (/^https?:\/\//i.test(endpoint)) {
			return endpoint;
		}

		return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
	}
}
