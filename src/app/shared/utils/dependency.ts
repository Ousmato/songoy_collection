import { inject, Injectable } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CategoryService } from "../../categorie/services/category.service";
import { ResponseMessageService } from "./response.message";
import { ArticleService } from "../../article/services/article.service";
import { FournisseurService } from "../../fournisseur/services/fournisseur.service";
import { AdminService } from "../../admin/service/admin.service";
import { ClientService } from "../../client/services/client.service";
import { CommandeService } from "../../commande/service/commande.service";
import { ReceptionService } from "../../achat/services/reception.service";
import { VenteService } from "../../vente/services/vente.service";
import { DepenseService } from "../../depense/services/depense.service";
import { DashboardService } from "../../dashbord/services/dashboard.service";

@Injectable({
    providedIn: 'root'
})
export class DependencyService {
    constructor( ){}
    fb = inject(FormBuilder);
    categoryService = inject(CategoryService);
    responseService = inject(ResponseMessageService);

    articleService = inject(ArticleService);
    fournisseurService = inject(FournisseurService);
    adminService = inject(AdminService);

    clientService = inject(ClientService);
    commandeService = inject(CommandeService);
    receptionService = inject(ReceptionService);
    venteService = inject(VenteService);
    depenseService = inject(DepenseService);
    dashboardService = inject(DashboardService);

    httpResponse = inject(ResponseMessageService)

}
