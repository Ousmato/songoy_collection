import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { finalize } from "rxjs/internal/operators/finalize";
import { httpResponse, ResponseMessageService } from "../../shared/utils/response.message";
import { Observable } from "rxjs/internal/Observable";
import { ArticleType, ArticleTypeResponse } from "../models/article-type";
import { ArticleContextDto, ArticleRequestDto, ArticleVariantDto, ArticleVariantRequestDto, SimpleArticleResponse } from "../models/article.model";
import { CouleurResponse } from "../models/article-couleur.model";
import { environment } from "../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    
    private readonly baseUrl = environment.api.baseUrl;
       constructor( private http: HttpClient, private loading : ResponseMessageService){}

       addArticle(article: ArticleRequestDto, idAdmin: number): Observable<httpResponse> {
        const formData = new FormData();
        formData.append('categoryId', String(article.categoryId));
        formData.append('articleTypeId', String(article.articleTypeId));
        for (const file of article.files ?? []) {
            formData.append('files', file, file.name);
        }

        this.loading.showLoading('Enregistrement de l’article...');
        return this.http.post<httpResponse>(
            `${this.baseUrl}/add-article/${idAdmin}`,
            formData
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       loadArticleContext(articleId: number, idAdmin: number): Observable<ArticleContextDto> {
        return this.http.get<ArticleContextDto>(
            `${this.baseUrl}/get-article-context/${articleId}/${idAdmin}`
        );
       }

       addArticleVariant(articleId: number, variant: ArticleVariantRequestDto, idAdmin: number): Observable<httpResponse> {
        return this.http.post<httpResponse>(
            `${this.baseUrl}/add-article-variant/${articleId}/${idAdmin}`,
            variant
        );
       }

       updateArticleVariant(variantId: number, variant: ArticleVariantRequestDto, idAdmin: number): Observable<httpResponse> {
        return this.http.put<httpResponse>(
            `${this.baseUrl}/update-article-variant/${variantId}/${idAdmin}`,
            variant
        );
       }

       loadArticleVariants(articleId: number, idAdmin: number): Observable<ArticleVariantDto[]> {
        return this.http.get<ArticleVariantDto[]>(
            `${this.baseUrl}/get-article-variants/${articleId}/${idAdmin}`
        );
       }

       addArticleType(articleType: ArticleType, idAdmin: number) : Observable<httpResponse>{
        this.loading.showLoading('Enregistrement de type d\article....');
        return this.http.post<httpResponse>(`${this.baseUrl}/add-article-type/${idAdmin}`, articleType).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
       }

       loadArticlesByCategoryId(idCategorie: number, idAdmin: number) : Observable<SimpleArticleResponse[]>{
        this.loading.showLoading("Chargement des arctiles....");
        return this.http.get<SimpleArticleResponse[]>(`${this.baseUrl}/get-articles-by-category/${idCategorie}/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
       }
       loadArticles(idAdmin: number) : Observable<SimpleArticleResponse[]>{
        this.loading.showLoading("Chargement des arctiles....");
        return this.http.get<SimpleArticleResponse[]>(`${this.baseUrl}/get-all-articles/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
       }

       loadCouleurs(idArticle: number, idAdmin: number) : Observable<CouleurResponse[]>{
        this.loading.showLoading("Chargement de couleur d'article....");
        return this.http.get<CouleurResponse[]>(`${this.baseUrl}/load-couleurs-by-article/${idArticle}/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
       }
       loadArticleType(idAdmin: number) : Observable<ArticleTypeResponse[]>{
        this.loading.showLoading("Chargement des types d'article....");
        return this.http.get<ArticleTypeResponse[]>(`${this.baseUrl}/get-all-article-type/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.closeLoading())
        );
       }
}
