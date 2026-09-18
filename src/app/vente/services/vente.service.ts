import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { httpResponse, ResponseMessageService } from '../../shared/utils/response.message';
import { VenteRequest } from '../models/vente.model';
import { ReglementRequest, ReglementResponse } from '../../achat/models/achat.dto';
import { VenteHistoriqueDetailDto, VenteHistoriqueDto } from '../models/vente.dto';



@Injectable({ providedIn: 'root' })
export class VenteService {
  private readonly http = inject(HttpClient);
  private readonly response = inject(ResponseMessageService);
  private readonly baseUrl = environment.api.baseUrl;

  addVente(adminId: number, request: VenteRequest): Observable<httpResponse> {
    this.response.showLoading('Enregistrement de la vente...');

    return this.http
      .post<httpResponse>(`${this.baseUrl}/add-vente/${adminId}`, request)
      .pipe(finalize(() => this.response.closeLoading()));
  }
  loadVenteHistorique(adminId: number): Observable<VenteHistoriqueDto[]> {
    this.response.showLoading('Chargement de la liste...');

    return this.http
      .get<VenteHistoriqueDto[]>(`${this.baseUrl}/get-historique-vente/${adminId}`)
      .pipe(finalize(() => this.response.closeLoading()));
  }
  loadVenteHistoriqueDetail(
    adminId: number,
    venteId: number,
  ): Observable<VenteHistoriqueDetailDto> {
    this.response.showLoading('Chargement du detail...');

    return this.http
      .get<VenteHistoriqueDetailDto>(
        `${this.baseUrl}/get-historique-detail-vente/${adminId}/${venteId}`,
      )
      .pipe(finalize(() => this.response.closeLoading()));
  }

  createReglementVente(
    venteId: number,
    adminId: number,
    request: ReglementRequest,
  ): Observable<ReglementResponse> {
    return this.http.post<ReglementResponse>(
      `${this.baseUrl}/ventes/${venteId}/reglements/${adminId}`,
      request,
    );
  }


}
