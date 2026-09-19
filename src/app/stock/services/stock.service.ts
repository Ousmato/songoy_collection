import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getUserFromSessionStorage } from '../../admin/shared/auth.util';
import { ActivitySpaceService, ActivitySpace } from '../../shared/service/activity-space.service';
import { StockMouvementFilters, StockMouvementHistoriqueDto } from '../models/stock.dto';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);
  private readonly activitySpace = inject(ActivitySpaceService);
  private readonly baseUrl = environment.api.baseUrl;

  getHistoriqueMouvements(
    adminId: number,
    filters: StockMouvementFilters,
  ): Observable<StockMouvementHistoriqueDto[]> {
    let params = new HttpParams().set('entite', this.resolveEntite());
    if (filters.debut) params = params.set('debut', filters.debut);
    if (filters.fin) params = params.set('fin', filters.fin);
    if (filters.type) params = params.set('type', filters.type);
    if (filters.recherche?.trim()) params = params.set('recherche', filters.recherche.trim());

    return this.http.get<StockMouvementHistoriqueDto[]>(
      `${this.baseUrl}/stock/mouvements/${adminId}`,
      { params },
    );
  }

  private resolveEntite(): ActivitySpace {
    const entite = getUserFromSessionStorage()?.entite;
    if (entite === 'BOUTIQUE' || entite === 'ATELIER') {
      return entite;
    }
    return this.activitySpace.space();
  }
}
