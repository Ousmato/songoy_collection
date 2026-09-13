import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FournisseurResponse } from "../models/fournisseur.model";
import { environment } from "../../../environments/environment";
import { LoaderService } from "../../shared/service/loader.service";
import { finalize, Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class FournisseurService {
    
    private readonly baseUrl = environment.api.baseUrl;
    constructor( private http: HttpClient, private loading : LoaderService){}
    

    loadFournisseurs(idAdmin: number): Observable<FournisseurResponse[]> {
        this.loading.loading();
        return this.http.get<FournisseurResponse[]>(`${this.baseUrl}/fournisseurs/${idAdmin}`).pipe(
            finalize(() => this.loading.stopLoading()));
    }
}