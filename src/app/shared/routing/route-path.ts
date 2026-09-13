import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

export const AdminRoutePaths = {
    addArticle: '/admin/add-article',
    addAchat: '/admin/add-achat',
    addVente: '/admin/add-vente',
    addReglement: '/admin/add-reglement',
    addCommande: '/admin/add-commande',
    addCouleur: '/admin/add-couleur',
    articleList: '/admin/article-list',
    listVentes: '/admin/list-ventes',
    listCommandes: '/admin/list-commandes',
    commandesAcceptees: '/admin/commandes-acceptees',
    commandesTerminees: '/admin/commandes-terminees',
    commandesLivrees: '/admin/commandes-livrees',
    creditsCommandes: '/admin/credits-commandes',
    reglementCredit: '/admin/reglement-credit',
    historiqueAchat: '/admin/historique-achat',
    stockParArticle: '/admin/stock-par-article',
    mouvementStock: '/admin/mouvement-stock',
} as const;

export type AdminRoutePath = typeof AdminRoutePaths[keyof typeof AdminRoutePaths];

@Injectable({
    providedIn: 'root'
})
export class RoutePath {
    constructor(private router: Router) { }

    toAddAchat() {
        this.router.navigate([AdminRoutePaths.addAchat]);
    }

    toAddVente() {
        this.router.navigate([AdminRoutePaths.addVente]);
    }

    toPath(path: AdminRoutePath) {
        this.router.navigate([path]);
    }
}
