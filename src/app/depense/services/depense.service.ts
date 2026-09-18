import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { httpResponse, ResponseMessageService } from '../../shared/utils/response.message';
import { DepenseHistoriqueDto, DepenseRequest } from '../model/depense.model';

@Injectable({ providedIn: 'root' })
export class DepenseService {
  private readonly http = inject(HttpClient);
  private readonly response = inject(ResponseMessageService);
  private readonly baseUrl = environment.api.baseUrl;

  addDepense(adminId: number, request: DepenseRequest): Observable<httpResponse> {
    this.response.showLoading('Enregistrement de la dépense...');

    return this.http
      .post<httpResponse>(`${this.baseUrl}/add-depense/${adminId}`, request)
      .pipe(finalize(() => this.response.closeLoading()));
  }
  getHistoriqueDepenses(
    adminId: number,
    debut?: string,
    fin?: string,
  ): Observable<DepenseHistoriqueDto[]> {
    this.response.showLoading('Chargement des dépenses...');

    let params = new HttpParams();
    if (debut) params = params.set('debut', debut);
    if (fin) params = params.set('fin', fin);

    return this.http
      .get<DepenseHistoriqueDto[]>(`${this.baseUrl}/get-depenses/${adminId}`, { params })
      .pipe(finalize(() => this.response.closeLoading()));
  }
}
