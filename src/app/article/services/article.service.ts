import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { finalize } from "rxjs/internal/operators/finalize";
import { httpResponse, ResponseMessageService } from "../../shared/utils/response.message";
import { Observable } from "rxjs/internal/Observable";
import { ArticleType, ArticleTypeResponse } from "../models/article-type";
import {
    ArticleContextDto,
    ArticleRequestDto,
    ArticleVariantDto,
    ArticleVariantPriceUpdateRequestDto,
    ArticleVariantRequestDto,
    DeclinaisonDto,
    DeclinaisonRequestDto,
    ModeleArticleDto,
    ModeleArticleRequestDto,
    SimpleArticleResponse,
} from "../models/article.model";
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

       loadModelesArticle(articleId: number, idAdmin: number): Observable<ModeleArticleDto[]> {
        this.loading.showLoading('Chargement des modèles...');
        return this.http.get<ModeleArticleDto[]>(
            `${this.baseUrl}/get-modeles-article/${articleId}/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       addModeleArticle(articleId: number, request: ModeleArticleRequestDto, idAdmin: number): Observable<ModeleArticleDto> {
        this.loading.showLoading('Enregistrement du modèle...');
        return this.http.post<ModeleArticleDto>(
            `${this.baseUrl}/add-modele-article/${articleId}/${idAdmin}`,
            request
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       addDeclinaison(
        modeleArticleId: number,
        request: DeclinaisonRequestDto,
        idAdmin: number,
        image?: File | null
       ): Observable<DeclinaisonDto> {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
        if (image) {
            formData.append('image', image, image.name);
        }

        this.loading.showLoading('Enregistrement de la déclinaison...');
        return this.http.post<DeclinaisonDto>(
            `${this.baseUrl}/add-declinaison/${modeleArticleId}/${idAdmin}`,
            formData
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       updateDeclinaison(
        declinaisonId: number,
        request: DeclinaisonRequestDto | null,
        idAdmin: number,
        image?: File | null
       ): Observable<DeclinaisonDto> {
        const formData = new FormData();
        if (request) {
            formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));
        }
        if (image) {
            formData.append('image', image, image.name);
        }

        this.loading.showLoading('Modification de la declinaison...');
        return this.http.put<DeclinaisonDto>(
            `${this.baseUrl}/update-declinaison/${declinaisonId}/${idAdmin}`,
            formData
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       loadDeclinaisonsModele(modeleArticleId: number, idAdmin: number): Observable<DeclinaisonDto[]> {
        this.loading.showLoading('Chargement des déclinaisons...');
        return this.http.get<DeclinaisonDto[]>(
            `${this.baseUrl}/get-declinaisons-modele/${modeleArticleId}/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       loadDeclinaisonVariants(declinaisonId: number, idAdmin: number): Observable<ArticleVariantDto[]> {
        this.loading.showLoading('Chargement des variantes...');
        return this.http.get<ArticleVariantDto[]>(
            `${this.baseUrl}/get-declinaison-variants/${declinaisonId}/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       addArticleVariant(
        declinaisonId: number,
        request: ArticleVariantRequestDto,
        idAdmin: number
       ): Observable<httpResponse> {
        this.loading.showLoading('Enregistrement de la variante...');
        return this.http.post<httpResponse>(
            `${this.baseUrl}/add-article-variant/${declinaisonId}/${idAdmin}`,
            request
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       updateArticleVariantPrice(
        variantId: number,
        idAdmin: number,
        request: ArticleVariantPriceUpdateRequestDto
       ): Observable<httpResponse> {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

        this.loading.showLoading('Modification du prix de la variante...');
        return this.http.put<httpResponse>(
            `${this.baseUrl}/update-article-variant/${variantId}/${idAdmin}`,
            formData
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       updateArticleVariant(
        variantId: number,
        idAdmin: number,
        request: ArticleVariantRequestDto
       ): Observable<httpResponse> {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(request)], { type: 'application/json' }));

        this.loading.showLoading('Modification de la variante...');
        return this.http.put<httpResponse>(
            `${this.baseUrl}/update-article-variant/${variantId}/${idAdmin}`,
            formData
        ).pipe(finalize(() => this.loading.closeLoading()));
       }

       deleteArticleVariant(variantId: number, idAdmin: number): Observable<httpResponse> {
        this.loading.showLoading('Suppression de la variante...');
        return this.http.delete<httpResponse>(
            `${this.baseUrl}/delete-article-variant/${variantId}/${idAdmin}`
        ).pipe(finalize(() => this.loading.closeLoading()));
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
