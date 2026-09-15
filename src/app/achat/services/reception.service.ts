import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReceptionRequest } from '../models/reception.model';
import {
  AchatHistoriqueDetailDto,
  AchatHistoriqueDto,
  ReglementRequest,
  ReglementResponse,
} from '../models/achat.dto';

export interface ReceptionResponse {
  id: number;
  reference: string;
  total: number;
  montantPaye: number;
  resteAPayer: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ReceptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.api.baseUrl;

  create(
    adminId: number,
    request: ReceptionRequest,
    idempotencyKey: string
  ): Observable<ReceptionResponse> {
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.http.post<ReceptionResponse>(
      `${this.baseUrl}/receptions/${adminId}`,
      request,
      { headers }
    );
  }

  loadHistorique(adminId: number): Observable<AchatHistoriqueDto[]> {
    return this.http.get<AchatHistoriqueDto[]>(
      `${this.baseUrl}/achats/historique/${adminId}`
    );
  }

  loadHistoriqueDetail(
    achatId: number,
    adminId: number
  ): Observable<AchatHistoriqueDetailDto> {
    return this.http.get<AchatHistoriqueDetailDto>(
      `${this.baseUrl}/achats/historique/${achatId}/${adminId}`
    );
  }

  createReglementAchat(
    achatId: number,
    adminId: number,
    request: ReglementRequest
  ): Observable<ReglementResponse> {
    return this.http.post<ReglementResponse>(
      `${this.baseUrl}/achats/${achatId}/reglements/${adminId}`,
      request
    );
  }
}
