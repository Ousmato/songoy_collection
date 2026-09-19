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
          import('../../dashbord/pages/dasboard/dasboard.component').then((m) => m.DasboardComponent),
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
        path: 'article-variants',
        title: 'Variantes article',
        data: { title: 'Variantes article' },
        loadComponent: () =>
          import('../../article/pages/article-variants/article-variants').then(
            (m) => m.ArticleVariants,
          ),
      },
      {
        path: 'article-variants/:articleId',
        title: 'Variantes article',
        data: { title: 'Variantes article' },
        loadComponent: () =>
          import('../../article/pages/article-variants/article-variants').then(
            (m) => m.ArticleVariants,
          ),
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
        title: 'Historique des ventes',
        data: { title: 'Historique des ventes' },
        loadComponent: () =>
          import('../../vente/pages/list-vente/list-vente').then((m) => m.ListVente),
      },
      {
        path: 'detail-vente/:venteId',
        title: 'Détail de la vente',
        data: { title: 'Détail de la vente' },
        loadComponent: () =>
          import('../../vente/pages/detail-vente/detail-vente').then((m) => m.DetailVente),
      },
      {
        path: 'add-vente',
        title: 'Nouvelle vente',
        data: { title: 'Nouvelle vente', viewportLayout: true },
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
          import('../../dashbord/pages/dasboard/dasboard.component').then((m) => m.DasboardComponent),
      },
      {
        path: 'add-achat',
        title: 'Nouvelle réception',
        data: { title: 'Nouvelle réception' },
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
        path: 'historique-achat/:achatId',
        title: "Détail de l'achat",
        data: { title: "Détail de l'achat" },
        loadComponent: () =>
          import('../../achat/pages/detail-achat/detail-achat').then(
            (m) => m.DetailAchat,
          ),
      },
      {
        path: 'stock-par-article',
        redirectTo: 'list-stock',
      },
      {
        path: 'mouvement-stock',
        title: 'Historique des mouvements',
        data: { title: 'Historique des mouvements' },
        loadComponent: () =>
          import('../../stock/pages/historique-mouvements/historique-mouvements').then(
            (m) => m.HistoriqueMouvements,
          ),
      },
      {
        path: 'clients',
        redirectTo: 'list-users',
      },
      {
        path: 'list-users',
        title: 'Liste des clients',
        data: { title: 'Liste des clients' },
        loadComponent: () =>
          import('../../client/pages/list-client/list-client').then((m) => m.ListClient),
      },
      {
        path: 'add-client',
        redirectTo: 'add-personnel',
      },
      {
        path: 'fournisseurs',
        title: 'Fournisseurs',
        data: { title: 'Fournisseurs' },
        loadComponent: () =>
          import('../../fournisseur/pages/list-fournisseur/list-fournisseur').then(
            (m) => m.ListFournisseur,
          ),
      },
      {
        path: 'add-fournisseur',
        title: 'Ajouter un fournisseur',
        data: { title: 'Fournisseurs', openAddModal: true },
        loadComponent: () =>
          import('../../fournisseur/pages/list-fournisseur/list-fournisseur').then(
            (m) => m.ListFournisseur,
          ),
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
        title: 'Ajouter un personnel',
        data: { title: 'Ajouter un personnel' },
        loadComponent: () =>
          import('../../admin/pages/add-personnel/add-personnel').then((m) => m.AddPersonnel),
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
        path: 'list-caracteristique',
        title: 'Caractéristiques',
        data: { title: 'Caractéristiques' },
        loadComponent: () =>
          import('../../categorie/pages/list-caracteristique/list-caracteristique').then(
            (m) => m.ListCaracteristique,
        ),
      },
      {
        path: 'add-attribute',
        title: 'Ajouter une caractéristique',
        data: { title: 'Ajouter une caractéristique' },
        loadComponent: () =>
          import('../../categorie/pages/add-attribute/add-attribute').then(
            (m) => m.AddAttribute,
          ),
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
        path: 'add-depense',
        title: 'Nouvelle dépense',
        data: { title: 'Nouvelle dépense' },
        loadComponent: () =>
          import('../../depense/components/add-depense/add-depense').then(
            (m) => m.AddDepense,
          ),
      },
      {
        path: 'list-depenses-atelier',
        title: 'Historique des dépenses',
        data: { title: 'Historique des dépenses' },
        loadComponent: () =>
          import('../../depense/pages/historique-depense/historique-depense').then(
            (m) => m.HistoriqueDepense,
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
