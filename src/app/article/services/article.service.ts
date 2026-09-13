import { Injectable } from "@angular/core";
import { LoaderService } from "../../shared/service/loader.service";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.production";
import { finalize } from "rxjs/internal/operators/finalize";
import { ResponseMessageService } from "../../shared/utils/response.message";
import { Observable } from "rxjs/internal/Observable";
import { ArticleType } from "../models/article-type";
import { SimpleArticleResponse } from "../models/article.model";
import { CouleurResponse } from "../models/article-couleur.model";

@Injectable({
    providedIn: 'root'
})
export class ArticleService {
    
    private readonly baseUrl = environment.api.baseUrl;
       constructor( private http: HttpClient, private loading : LoaderService){}

       addArticleType(articleType: ArticleType, idAdmin: number) : Observable<ResponseMessageService>{
        this.loading.loading();
        return this.http.post<ResponseMessageService>(`${this.baseUrl}/add-article-type/${idAdmin}`, articleType).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
       }

       loadArticles(idCategorie: number, idAdmin: number) : Observable<SimpleArticleResponse[]>{
        this.loading.loading();
        return this.http.get<SimpleArticleResponse[]>(`${this.baseUrl}/load-articles-by-categorie/${idCategorie}/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
       }

       loadCouleurs(idArticle: number, idAdmin: number) : Observable<CouleurResponse[]>{
        this.loading.loading();
        return this.http.get<CouleurResponse[]>(`${this.baseUrl}/load-couleurs-by-article/${idArticle}/${idAdmin}`).pipe(
            // Finalize the loading state when the request completes
            finalize(() => this.loading.stopLoading())
        );
       }
}