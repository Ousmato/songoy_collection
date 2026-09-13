import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
  {
    path: 'login',
    title: 'Connexion',
    loadComponent: () =>
      import('../../login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'admin',
    title: 'Administration',
    loadComponent: () =>
      import('../../layouts/shell-layout.component').then((m) => m.ShellLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
      {
        path: 'dashboard',
        title: 'Dashboard',
        data: { title: 'Dashboard' },
        loadComponent: () =>
          import('../../dasboard/dasboard.component').then((m) => m.DasboardComponent),
      },
      {
        path: 'list-articles',
        title: 'Articles',
        data: { title: 'Articles' },
        loadComponent: () =>
          import('../../article/pages/article-menue/article-menue').then((m) => m.ArticleMenue),
      },
      {
        path: 'add-article',
        title: 'Nouvel article',
        data: { title: 'Nouvel article' },
        loadComponent: () =>
          import('../../article/pages/add-article/add-article').then((m) => m.AddArticle),
      },
      {
        path: 'article-list',
        title: 'Liste des articles',
        data: { title: 'Liste des articles' },
        loadComponent: () =>
          import('../../article/pages/list-article/list-article').then((m) => m.ListArticle),
      },
      {
        path: 'list-article-category',
        title: 'Categories article',
        data: { title: 'Categories article' },
        loadComponent: () =>
          import('../../categorie/pages/list-categorie/list-categorie.component').then(
            (m) => m.ListCategorieComponent,
          ),
      },
      {
        path: 'list-article-type',
        title: "Types d'articles",
        data: { title: "Types d'articles" },
        loadComponent: () =>
          import('../../article/pages/list-type-article/list-type-article').then(
            (m) => m.ListTypeArticle,
          ),
      },
      {
        path: 'add-categorie',
        redirectTo: 'list-article-category',
      },
      {
        path: 'add-type-article',
        redirectTo: 'list-article-type',
      },
      {
        path: 'list-ventes',
        title: 'Ventes',
        data: { title: 'Ventes' },
        loadComponent: () =>
          import('../../vente/pages/vete-menue/vete-menue').then((m) => m.VeteMenue),
      },
      {
        path: 'add-vente',
        title: 'Nouvelle vente',
        data: { title: 'Nouvelle vente' },
        loadComponent: () =>
          import('../../vente/pages/add-vente/add-vente').then((m) => m.AddVente),
      },
      {
        path: 'add-reglement',
        redirectTo: 'list-ventes',
      },
      {
        path: 'add-commande',
        title: 'Nouvelle commande',
        data: { title: 'Nouvelle commande' },
        loadComponent: () =>
          import('../../commande/pages/add-commande/add-commande').then((m) => m.AddCommande),
      },
      {
        path: 'list-commandes',
        title: 'Commandes atelier',
        data: { title: 'Commandes atelier' },
        loadComponent: () =>
          import('../../commande/pages/list-commande/list-commande').then((m) => m.ListCommande),
      },
      {
        path: 'commandes-acceptees',
        title: 'Commandes acceptees',
        data: { title: 'Commandes acceptees' },
        loadComponent: () =>
          import('../../commande/pages/commande-accepter/commande-accepter').then(
            (m) => m.CommandeAccepter,
          ),
      },
      {
        path: 'commandes-terminees',
        redirectTo: 'list-commandes',
      },
      {
        path: 'commandes-livrees',
        redirectTo: 'list-commandes',
      },
      {
        path: 'credits-commandes',
        redirectTo: 'list-commandes',
      },
      {
        path: 'reglement-credit',
        redirectTo: 'list-ventes',
      },
      {
        path: 'categories',
        redirectTo: 'list-article-category',
      },
      {
        path: 'achats',
        title: 'Achats',
        data: { title: 'Achats' },
        loadComponent: () =>
          import('../../dasboard/dasboard.component').then((m) => m.DasboardComponent),
      },
      {
        path: 'add-achat',
        title: 'Nouvel achat',
        data: { title: 'Nouvel achat' },
        loadComponent: () =>
          import('../../achat/pages/ajouter-achat/ajouter-achat').then((m) => m.AjouterAchat),
      },
      {
        path: 'stock',
        redirectTo: 'list-stock',
      },
      {
        path: 'list-stock',
        title: 'Stock',
        data: { title: 'Stock' },
        loadComponent: () =>
          import('../../stock/pages/stock-menue/stock-menue').then((m) => m.StockMenue),
      },
      {
        path: 'historique-achat',
        title: "Historique d'achat",
        data: { title: "Historique d'achat" },
        loadComponent: () =>
          import('../../achat/pages/historique-achat/historique-achat').then(
            (m) => m.HistoriqueAchat,
          ),
      },
      {
        path: 'stock-par-article',
        redirectTo: 'list-stock',
      },
      {
        path: 'mouvement-stock',
        redirectTo: 'list-stock',
      },
      {
        path: 'clients',
        redirectTo: 'list-users',
      },
      {
        path: 'list-users',
        redirectTo: 'list-personnel',
      },
      {
        path: 'add-client',
        redirectTo: 'list-personnel',
      },
      {
        path: 'fournisseurs',
        redirectTo: 'list-personnel',
      },
      {
        path: 'add-fournisseur',
        redirectTo: 'list-personnel',
      },
      {
        path: 'personnel-list',
        title: 'Liste personnel',
        data: { title: 'Liste personnel' },
        loadComponent: () =>
          import('../../admin/pages/list-personnel/list-personnel').then((m) => m.ListPersonnel),
      },
      {
        path: 'add-personnel',
        redirectTo: 'list-personnel',
      },
      {
        path: 'list-personnel',
        title: 'Personnel',
        data: { title: 'Personnel' },
        loadComponent: () =>
          import('../../admin/pages/personnel-menue/personnel-menue').then(
            (m) => m.PersonnelMenue,
          ),
      },
      {
        path: 'list-paramettre',
        title: 'Settings',
        data: { title: 'Settings' },
        loadComponent: () =>
          import('../../setting/pages/setting-menue/setting-menue').then((m) => m.SettingMenue),
      },
      {
        path: 'configuration-boutique',
        redirectTo: 'list-paramettre',
      },
      {
        path: 'preferences',
        redirectTo: 'list-paramettre',
      },
      {
        path: 'list-depenses-atelier',
        title: 'Depenses du mois',
        data: { title: 'Depenses du mois' },
        loadComponent: () =>
          import('../../depense/pages/list-depenses-atelier/list-depenses-atelier').then(
            (m) => m.ListDepensesAtelier,
          ),
      },
    ],
  },
  {
    path: 'app',
    redirectTo: 'admin',
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
