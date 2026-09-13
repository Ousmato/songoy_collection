import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select2, Select2Data, Select2Option, Select2UpdateEvent } from 'ng-select2-component';
import { CouleurResponse } from '../../../article/models/article-couleur.model';
import { SimpleArticleResponse } from '../../../article/models/article.model';
import { Categorie } from '../../../categorie/models/categorie.model';
import { FloatingBackButton } from '../../../shared/components/floating-back-button/floating-back-button';
import { ModePaiement, ModePaiementKey } from '../../../shared/model/util.enum';
import { DependencyService } from '../../../shared/utils/dependency';
import { getUserFromSessionStorage } from '../../../admin/shared/auth.util';
import { RequestAchat } from '../../models/achat.model';
import { AchatCouleurBottomSheet } from '../../components/achat-couleur-bottom-sheet/achat-couleur-bottom-sheet';
import { AchatSommaire } from '../../components/achat-sommaire/achat-sommaire';
import { EnumMethodes } from '../../../shared/utils/util-methode';


@Component({
  selector: 'app-ajouter-achat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Select2,
    FloatingBackButton,
    AchatCouleurBottomSheet,
    AchatSommaire,
  ],
  templateUrl: './ajouter-achat.html',
  styleUrl: './ajouter-achat.css',
})
export class AjouterAchat implements OnInit {
  user = getUserFromSessionStorage();
  form!: FormGroup;
  dependenceService = inject(DependencyService);

  categoriesData: Select2Data = [];
  articlesData: Select2Data = [];
  fournisseursData: Select2Data = [];

  couleurs = signal<CouleurResponse[]>([]);
  selectedCouleurs = signal<CouleurResponse[]>([]);
  showCouleurSheet = signal(false);
  lastRequest = signal<RequestAchat | null>(null);

  modePaiementOptions = EnumMethodes.getEnumeratedKeyValue(ModePaiement);

  today = new Date().toLocaleDateString('fr-FR', {
    month: 'long',
    year: 'numeric',
  });

  ngOnInit(): void {
    this.loadForm();
    this.loadCategories();
    this.loadFournisseurs();
  }

  loadForm(): void {
    this.form = this.dependenceService.fb.group({
      date: ['', Validators.required],
      frais: [0, [Validators.required, Validators.min(0)]],
      idFournisseur: [''],
      modePaiement: ['CASH' satisfies ModePaiementKey, Validators.required],
      fournisseurNom: [''],
      idCategorie: ['', Validators.required],
      idArticle: ['', Validators.required],
    });
  }

  loadCategories(): void {
    if (!this.user?.id) return;

    this.dependenceService.categoryService.loadCategories(this.user.id).subscribe(res => {
      this.categoriesData = res.map<Select2Option>((cat: Categorie, index) => ({
        id: `cat-${cat.id ?? index}-${index}`,
        value: cat.id ?? '',
        label: cat.nom || 'Categorie non definit',
      })) as Select2Data;
    });
  }

  loadArticles(idCategorie: number): void {
    if (!idCategorie || !this.user?.id) return;

    this.dependenceService.articleService.loadArticles(idCategorie, this.user.id).subscribe(res => {
      this.articlesData = res.map<Select2Option>((art: SimpleArticleResponse, index) => ({
        id: `art-${art.id ?? index}-${index}`,
        value: art.id,
        label: art.nom || 'Article non definit',
      })) as Select2Data;
    });
  }

  loadCouleurs(idArticle: number): void {
    if (!idArticle || !this.user?.id) return;

    this.dependenceService.articleService.loadCouleurs(idArticle, this.user.id).subscribe(res => {
      this.couleurs.set(res);
    });
  }

  loadFournisseurs(): void {
    if (!this.user?.id) return;

    this.dependenceService.fournisseurService.loadFournisseurs(this.user.id).subscribe(res => {
      this.fournisseursData = res.map<Select2Option>((fou: any, index) => ({
        id: `fou-${fou.id ?? index}-${index}`,
        value: fou.id ?? '',
        label: `${fou.nom ?? ''} ${fou.prenom ?? ''}`.trim() || 'Fournisseur non definit',
      })) as Select2Data;
    });
  }

  onCategorieUpdate(event: Select2UpdateEvent): void {
    this.onCategorieChange(String(event.value ?? ''));
  }

  onArticleUpdate(event: Select2UpdateEvent): void {
    this.onArticleChange(String(event.value ?? ''));
  }

  onCategorieChange(value: string): void {
    const idCategorie = Number(value);
    this.form.patchValue({ idArticle: '' });
    this.articlesData = [];
    this.couleurs.set([]);
    this.selectedCouleurs.set([]);

    if (idCategorie) this.loadArticles(idCategorie);
  }

  onArticleChange(value: string): void {
    const idArticle = Number(value);
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

  selectedCouleurIds(): number[] {
    return this.selectedCouleurs().map(couleur => couleur.id);
  }

  selectedArticleName(): string {
    const idArticle = Number(this.form?.value?.idArticle);
    return (this.articlesData as Select2Option[]).find(article => Number(article.value) === idArticle)?.label ?? 'Article';
  }

  handleSubmit(request: RequestAchat): void {
    this.lastRequest.set(request);
    console.log('RequestAchat simulation', request);
  }
}
