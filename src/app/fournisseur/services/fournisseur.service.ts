import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FournisseurRequestDto, FournisseurResponse } from "../models/fournisseur.model";
import { environment } from "../../../environments/environment";
import { LoaderService } from "../../shared/service/loader.service";
import { finalize, Observable } from "rxjs";
import { httpResponse, ResponseMessageService } from "../../shared/utils/response.message";

@Injectable({
    providedIn: 'root',
})
export class FournisseurService {
    
    private readonly baseUrl = environment.api.baseUrl;
    constructor( private http: HttpClient, private loading : ResponseMessageService){}
    

    loadFournisseurs(idAdmin: number): Observable<FournisseurResponse[]> {
        this.loading.showLoading("Chargement des fournisseurs....");
        return this.http.get<FournisseurResponse[]>(`${this.baseUrl}/fournisseurs/${idAdmin}`).pipe(
            finalize(() => this.loading.closeLoading()));
    }

    addFournisseur(idAdmin: number, payload: FournisseurRequestDto) : Observable<httpResponse>{
        this.loading.showLoading("Enregistrement du fournisseur...")
        return this.http.post<httpResponse>(`${this.baseUrl}/add-fournisseur/${idAdmin}`, payload).pipe(
            finalize(() => this.loading.closeLoading())
        )
    }
}