import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { finalize, Observable } from 'rxjs';
import { LoginResponseDto } from '../model/admin.model';
import { Router } from '@angular/router';
import { LoaderService } from '../../shared/service/loader.service';
import { AppRouteReuseStrategy } from '../../shared/routing/routestrategy';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url = `${environment.api}`;
  private USER_KEY = 'user';
  private TOKEN_KEY = 'accessToken';

  constructor(
    private http: HttpClient,
    private router: Router,
    private loaderService: LoaderService,
    private routeReuseStrategy: AppRouteReuseStrategy,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  login(email: string, password: string): Observable<LoginResponseDto> {
    this.loaderService.loading();
    return this.http
      .post<LoginResponseDto>(`${this.url}login`, { email, password })
      .pipe(finalize(() => this.loaderService.stopLoading()));
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  getUser(): LoginResponseDto | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const userJson = sessionStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    this.clearSessionState();
    this.router.navigate(['/admin']);
  }

  private clearSessionState(): void {
    this.routeReuseStrategy.clearAll();

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    sessionStorage.removeItem(this.USER_KEY);
    sessionStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem('lastUrl');
  }
}
