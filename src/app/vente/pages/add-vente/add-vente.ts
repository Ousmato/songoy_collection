import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select2, Select2Data, Select2Option, Select2UpdateEvent } from 'ng-select2-component';
import { CouleurResponse } from '../../../article/models/article-couleur.model';
import { SimpleArticleResponse } from '../../../article/models/article.model';
import { Categorie } from '../../../categorie/models/categorie.model';
import { Client } from '../../../client/models/client.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ModePaiement, ModePaiementKey } from '../../../shared/model/util.enum';
import { DependencyService } from '../../../shared/utils/dependency';
import { EnumMethodes } from '../../../shared/utils/util-methode';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { AddVenteCouleurBottomSheet } from '../../components/add-vente-couleur-bottom-sheet/add-vente-couleur-bottom-sheet';
import { AddVenteSommary } from '../../components/add-vente-sommary/add-vente-sommary';
import { VenteRequest } from '../../models/vente.model';

@Component({
  selector: 'app-add-vente',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Select2,
    FloatingBackButton,
    AddVenteCouleurBottomSheet,
    AddVenteSommary,
  ],
  templateUrl: './add-vente.html',
  styleUrl: './add-vente.css',
})
export class AddVente implements OnInit {
  user = getUserFromSessionStorage();
  dependencyService = inject(DependencyService);
  form!: FormGroup;

  modePaiementOptions = EnumMethodes.getEnumeratedKeyValue(ModePaiement);
  clientListOptionsData: Select2Data = [];
  categoriesData: Select2Data = [];
  articlesData: Select2Data = [];

  couleurs = signal<CouleurResponse[]>([]);
  selectedCouleurs = signal<CouleurResponse[]>([]);
  selectedCouleurIds = computed(() => this.selectedCouleurs().map(couleur => couleur.id));
  showCouleurSheet = signal(false);
  lastRequest = signal<VenteRequest | null>(null);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  ngOnInit(): void {
    this.loadForm();
    this.loadClients();
    this.loadCategories();
  }

  loadForm(): void {
    this.form = this.dependencyService.fb.group({
      date: ['', Validators.required],
      clientId: [''],
      clientNom: [''],
      modePaiement: ['CASH' satisfies ModePaiementKey, Validators.required],
      idCategorie: ['', Validators.required],
      idArticle: ['', Validators.required],
    });
  }

  loadClients(): void {
    if (!this.user?.id) return;

    this.dependencyService.clientService.loadClients(this.user.id).subscribe(res => {
      this.clientListOptionsData = res.map<Select2Option>((client: Client, index) => ({
        id: `client-${client.id ?? index}-${index}`,
        value: client.id ?? '',
        label: `${client.nom ?? ''} ${client.prenom ?? ''}`.trim() || 'Client non definit',
      })) as Select2Data;
    });
  }

  loadCategories(): void {
    if (!this.user?.id) return;

    this.dependencyService.categoryService.loadCategories(this.user.id).subscribe(res => {
      this.categoriesData = res.map<Select2Option>((cat: Categorie, index) => ({
        id: `cat-${cat.id ?? index}-${index}`,
        value: cat.id ?? '',
        label: cat.nom || 'Categorie non definit',
      })) as Select2Data;
    });
  }

  loadArticles(idCategorie: number): void {
    if (!idCategorie || !this.user?.id) return;

    this.dependencyService.articleService.loadArticles(idCategorie, this.user.id).subscribe(res => {
      this.articlesData = res.map<Select2Option>((art: SimpleArticleResponse, index) => ({
        id: `art-${art.id ?? index}-${index}`,
        value: art.id,
        label: art.nom || 'Article non definit',
      })) as Select2Data;
    });
  }

  loadCouleurs(idArticle: number): void {
    if (!idArticle || !this.user?.id) return;

    this.dependencyService.articleService.loadCouleurs(idArticle, this.user.id).subscribe(res => {
      this.couleurs.set(res);
    });
  }

  onCategorieUpdate(event: Select2UpdateEvent): void {
    const idCategorie = Number(event.value ?? '');
    this.form.patchValue({ idArticle: '' });
    this.articlesData = [];
    this.couleurs.set([]);
    this.selectedCouleurs.set([]);

    if (idCategorie) this.loadArticles(idCategorie);
  }

  onArticleUpdate(event: Select2UpdateEvent): void {
    const idArticle = Number(event.value ?? '');
    this.couleurs.set([]);
    this.selectedCouleurs.set([]);

    if (idArticle) this.loadCouleurs(idArticle);
  }

  openCouleurSheet(): void {
    this.showCouleurSheet.set(true);
  }

  closeCouleurSheet(): void {
    this.showCouleurSheet.set(false);
  }

  applyCouleurs(couleurs: CouleurResponse[]): void {
    this.selectedCouleurs.set(couleurs);
    this.closeCouleurSheet();
  }

  removeCouleur(idCouleur: number): void {
    this.selectedCouleurs.set(this.selectedCouleurs().filter(couleur => couleur.id !== idCouleur));
  }

  selectedArticleName(): string {
    const idArticle = Number(this.form?.value?.idArticle);
    return (this.articlesData as Select2Option[]).find(article => Number(article.value) === idArticle)?.label ?? 'Article';
  }

  handleSubmit(request: VenteRequest): void {
    this.lastRequest.set(request);
    console.log('VenteRequest simulation', request);
  }
}
