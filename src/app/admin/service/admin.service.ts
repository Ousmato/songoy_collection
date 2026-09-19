import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { LoaderService } from "../../shared/service/loader.service";
import { finalize } from "rxjs/internal/operators/finalize";
import { LoginRequestDto, LoginResponseDto, PersonnelMenuStatsDto, PersonnelRequestDto, SimplePersonnelResponse } from "../model/admin.model";
import { Observable } from "rxjs/internal/Observable";
import { httpResponse } from "../../shared/utils/response.message";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
   private readonly baseUrl = environment.api.baseUrl;
       constructor( private http: HttpClient, private loading : LoaderService){}

    loadPersonnel(idAdmin: number) : Observable<SimplePersonnelResponse[]>{
        this.loading.loading();
        return this.http.get<SimplePersonnelResponse[]>(`${this.baseUrl}/load-personnel/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
    }

    loadPersonnelMenuStats(idAdmin: number): Observable<PersonnelMenuStatsDto> {
        this.loading.loading();
        return this.http.get<PersonnelMenuStatsDto>(`${this.baseUrl}/personnel-menu/statistiques/${idAdmin}`).pipe(
            finalize(() => this.loading.stopLoading())
        );
    }

    login(payload: LoginRequestDto) : Observable<LoginResponseDto>{
        this.loading.loading();
        return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, payload).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
    }

    addPersonnel(payload: PersonnelRequestDto, idAdmin: number): Observable<httpResponse
    > {
        this.loading.loading();
        return this.http.post<httpResponse>(`${this.baseUrl}/add-personnel/${idAdmin}`, payload).pipe(
            finalize(() => this.loading.stopLoading())
        );
    }

}
