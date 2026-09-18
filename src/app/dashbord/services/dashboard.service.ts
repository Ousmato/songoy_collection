import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ResponseMessageService } from '../../shared/utils/response.message';
import { getUserFromSessionStorage } from '../../admin/shared/auth.util';
import { ActivitySpaceService } from '../../shared/service/activity-space.service';
import { DashboardAlerteStockDto, DashboardIndicateurs, DashboardTopProduitDto, DashboardVenteJour } from '../model/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly response = inject(ResponseMessageService);
  private readonly activity = inject(ActivitySpaceService);
  private readonly baseUrl = environment.api.baseUrl;

  getIndicateurs(
    adminId: number,
    debut?: string,
    fin?: string,
  ): Observable<DashboardIndicateurs> {
    this.response.showLoading('Chargement des indicateurs...');

    let params = new HttpParams();
    if (debut && fin) {
      params = params.set('debut', debut).set('fin', fin);
    } else if (debut) {
      params = params.set('date', debut);
    }
    params = params.set('entite', this.resolveEntite());

    return this.http
      .get<DashboardIndicateurs>(`${this.baseUrl}/dashboard/indicateurs/${adminId}`, { params })
      .pipe(finalize(() => this.response.closeLoading()));
  }

  getVentesDuJour(adminId: number): Observable<DashboardVenteJour[]> {
    this.response.showLoading('Chargement des ventes du jour...');

    const params = new HttpParams().set('entite', this.resolveEntite());
    return this.http
      .get<DashboardVenteJour[]>(`${this.baseUrl}/dashboard/ventes-jour/${adminId}`, { params })
      .pipe(finalize(() => this.response.closeLoading()));
  }

  getTopProduits(
    adminId: number,
    debut?: string,
    fin?: string,
  ): Observable<DashboardTopProduitDto[]> {
    this.response.showLoading('Chargement des produits les plus vendus...');

    let params = new HttpParams().set('entite', this.resolveEntite());
    if (debut && fin) {
      params = params.set('debut', debut).set('fin', fin);
    } else if (debut) {
      params = params.set('date', debut);
    }

    return this.http
      .get<DashboardTopProduitDto[]>(`${this.baseUrl}/dashboard/top-produits/${adminId}`, { params })
      .pipe(finalize(() => this.response.closeLoading()));
  }

  getAlertesStock(adminId: number): Observable<DashboardAlerteStockDto[]> {
    this.response.showLoading('Chargement des alertes stock...');

    const params = new HttpParams().set('entite', this.resolveEntite());
    return this.http
      .get<DashboardAlerteStockDto[]>(`${this.baseUrl}/dashboard/alertes-stock/${adminId}`, { params })
      .pipe(finalize(() => this.response.closeLoading()));
  }

  private resolveEntite(): 'BOUTIQUE' | 'ATELIER' {
    const user = getUserFromSessionStorage();
    if (user?.entite === 'BOUTIQUE' || user?.entite === 'ATELIER') {
      return user.entite;
    }
    return this.activity.space();
  }
}
