import { StatutPaiement } from '../../achat/models/achat.enum';
import { CategoryMesure } from '../../categorie/models/categorie.enum';
import { ModePaiement } from '../../shared/model/util.enum';

/** Données synthétiques utilisées par la liste des ventes. */
export interface VenteHistoriqueDto {
  id: number;
  numeroFacture: string | null;
  date: string;
  client: string | null;
  totalVente: number;
  montantPaye: number;
  resteAPayer: number;
  statutPaiement: StatutPaiement;
  modePaiement: ModePaiement;
}

export interface LigneVenteHistorique {
  id: number;
  variantId: number;
  referenceVariant: string;
  articleId: number;
  article: string;
  modele: string;
  marque: string | null;
  unite: CategoryMesure;
  attributsDeclinaison: VenteAttributHistoriqueDto[];
  attributsVariante: VenteAttributHistoriqueDto[];
  quantite: number;
  prixVente: number;
  totalLigne: number;
}

export interface VenteAttributHistoriqueDto {
  id: number;
  label: string;
  value: string;
}

export interface PaiementVenteHistorique {
  id: number;
  date: string;
  montant: number;
  modePaiement: ModePaiement;
}

export interface VenteHistoriqueDetailDto extends VenteHistoriqueDto {

   lignes: LigneVenteHistorique[];
   paiements: PaiementVenteHistorique[];

}
