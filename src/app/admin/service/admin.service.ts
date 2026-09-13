import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";
import { LoaderService } from "../../shared/service/loader.service";
import { finalize } from "rxjs/internal/operators/finalize";
import { SimpleAdminResponse } from "../model/admin.model";
import { Observable } from "rxjs/internal/Observable";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
   private readonly baseUrl = environment.api.baseUrl;
       constructor( private http: HttpClient, private loading : LoaderService){}

    loadPersonnel(idAdmin: number) : Observable<SimpleAdminResponse[]>{
        this.loading.loading();
        return this.http.get<SimpleAdminResponse[]>(`${this.baseUrl}/load-personnel/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
    }

}