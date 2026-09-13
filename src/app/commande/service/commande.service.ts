import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { LoaderService } from "../../shared/service/loader.service";
import { CommandeRequest, CommandeResponse } from "../model/commande.model";
import { Observable } from "rxjs/internal/Observable";
import { ResponseMessageService } from "../../shared/utils/response.message";
import { finalize } from "rxjs/internal/operators/finalize";

@Injectable({
    providedIn: 'root'
})
export class CommandeService {
    private readonly baseUrl = environment.api.baseUrl;
       constructor( private http: HttpClient, private loading : LoaderService){}

       addCommande(commande: CommandeRequest, idAdmin: number) : Observable<ResponseMessageService> {{
        this.loading.loading();
        return this.http.post<ResponseMessageService>(`${this.baseUrl}/add-commande/${idAdmin}`, commande).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
       }

          

    }


    loadCommandes(idAdmin: number) : Observable<CommandeResponse[]>{
        this.loading.loading();
        return this.http.get<CommandeResponse[]>(`${this.baseUrl}/load-commandes/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
       }
       
       loadCommandesByStatut(idAdmin: number, statut: string) : Observable<CommandeResponse[]>{
        this.loading.loading();
        return this.http.get<CommandeResponse[]>(`${this.baseUrl}/load-commandes-by-statut/${idAdmin}/${statut}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
       }
       
}