import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface InitialStockRequest {
  quantity: number;
  date: string;
  observation: string;
}

@Injectable({ providedIn: 'root' })
export class InitialStockService {
  private readonly http = inject(HttpClient);

  availability(variantId: number, adminId: number) {
    return this.http.get<{ available: boolean }>(this.url(variantId, adminId));
  }

  create(variantId: number, adminId: number, request: InitialStockRequest) {
    return this.http.post<{ message: string }>(this.url(variantId, adminId), request);
  }

  private url(variantId: number, adminId: number): string {
    return `${environment.api.baseUrl}/initial-stock/${variantId}/${adminId}`;
  }
}
