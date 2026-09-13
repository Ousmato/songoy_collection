import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { LoaderService } from "../../shared/service/loader.service";
import { finalize } from "rxjs/internal/operators/finalize";
import { Observable } from "rxjs/internal/Observable";
import { Client } from "../models/client.model";

@Injectable({
    providedIn: 'root'
})
export class ClientService {
    private readonly baseUrl = environment.api.baseUrl;
       constructor( private http: HttpClient, private loading : LoaderService){}

       loadClients(idAdmin: number) : Observable<Client[]> {
        this.loading.loading();
        return this.http.get<Client[]>(`${this.baseUrl}/load-clients/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
    }

}