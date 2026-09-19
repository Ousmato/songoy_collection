import { Entite } from '../../admin/model/admin.enum';

export interface Client {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    adresse?: string;
    entite?: Entite | null;
    dateAjout?: string;
}
