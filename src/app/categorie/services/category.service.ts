import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Categorie } from "../models/categorie.model";
import { CategoryAttributeDto, CategoryAttributeRequestDto, CategoryNameUpdateRequestDto } from "../models/categorie.dto";
import { finalize, Observable } from "rxjs";
import { CategoryDto } from "../models/categorie.dto";
import { httpResponse, ResponseMessageService } from "../../shared/utils/response.message";

@Injectable({
    providedIn: 'root'
})
export class CategoryService {
    private readonly baseUrl = environment.api.baseUrl;
    constructor(private http: HttpClient, private loading: ResponseMessageService) { }

    addCategorie(category: Categorie, idAdmin: number): Observable<httpResponse> {
        this.loading.showLoading('Enregistrement de la catégorie...');
        return this.http.post<httpResponse>(`${this.baseUrl}/add-categorie/${idAdmin}`, category).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
    }

    loadCategories(idAdmin: number): Observable<CategoryDto[]> {
        this.loading.showLoading('Chargement des catégories...');
        return this.http.get<CategoryDto[]>(`${this.baseUrl}/get-all-category/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
    }

    updateCategoryName(
        categoryId: number,
        idAdmin: number,
        payload: CategoryNameUpdateRequestDto
    ): Observable<httpResponse> {
        this.loading.showLoading('Modification du nom de la categorie...');
        return this.http.put<httpResponse>(
            `${this.baseUrl}/update-category-name/${categoryId}/${idAdmin}`,
            payload
        ).pipe(finalize(() => this.loading.closeLoading()));
    }

    deleteCategory(categoryId: number, idAdmin: number): Observable<httpResponse> {
        this.loading.showLoading('Suppression de la categorie...');
        return this.http.delete<httpResponse>(
            `${this.baseUrl}/delete-category/${categoryId}/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
    }
    addAttributeToCategories(
        attribute: CategoryAttributeRequestDto,
        idAdmin: number
    ): Observable<{ message?: string }> {
        this.loading.showLoading('Enregistrement de l’attribut...');
        return this.http.post<{ message?: string }>(
            `${this.baseUrl}/add-category-attribute/${idAdmin}`,
            attribute
        ).pipe(finalize(() => this.loading.closeLoading()));
    }

    loadAttributes(categoryId: number, idAdmin: number): Observable<CategoryAttributeDto[]> {
        this.loading.showLoading('Chargement des attributs...');
        return this.http.get<CategoryAttributeDto[]>(
            `${this.baseUrl}/get-category-attributes/${categoryId}/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
    }

    loadAllCategoryAttributes(idAdmin: number): Observable<CategoryAttributeDto[]> {
        this.loading.showLoading('Chargement des caractéristiques...');
        return this.http.get<CategoryAttributeDto[]>(
            `${this.baseUrl}/get-all-category-attributes/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
    }

}
