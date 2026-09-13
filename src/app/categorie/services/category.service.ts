import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Categorie } from "../models/categorie.model";
import { finalize, Observable } from "rxjs";
import { ResponseMessageService } from "../../shared/utils/response.message";
import { LoaderService } from "../../shared/service/loader.service";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly baseUrl = environment.api.baseUrl;
    constructor(private http: HttpClient, private loading: LoaderService) { }

    addCategorie(category: Categorie, idAdmin: number): Observable<ResponseMessageService> {
        this.loading.loading();
        return this.http.post<ResponseMessageService>(`${this.baseUrl}/add-categorie/${idAdmin}`, category).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
    }

    loadCategories(idAdmin: number): Observable<Categorie[]> {
        this.loading.loading();
        return this.http.get<Categorie[]>(`${this.baseUrl}/load-categories/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
    }

}
