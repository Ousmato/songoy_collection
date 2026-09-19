import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getUserFromSessionStorage } from '../../admin/shared/auth.util';
import { ActivitySpace, ActivitySpaceService } from '../../shared/service/activity-space.service';
import { SettingMenuStats } from '../model/setting.dto';

@Injectable({ providedIn: 'root' })
export class SettingService {
  private readonly http = inject(HttpClient);
  private readonly activitySpace = inject(ActivitySpaceService);
  private readonly baseUrl = environment.api.baseUrl;

  getMenuStats(adminId: number): Observable<SettingMenuStats> {
    const params = new HttpParams().set('entite', this.resolveEntite());
    return this.http.get<SettingMenuStats>(
      `${this.baseUrl}/setting-menu/statistiques/${adminId}`,
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
